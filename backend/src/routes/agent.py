import os

from dotenv import load_dotenv
from fastapi import APIRouter
from fastapi.responses import JSONResponse, StreamingResponse
from google.adk.agents.run_config import RunConfig, StreamingMode
from google.adk.cli.utils.common import BaseModel
from google.adk.runners import Runner
from google.adk.sessions import DatabaseSessionService
from google.genai import types

from agent.agent import get_agent

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
APP_NAME = os.getenv("APP_NAME")
print(DATABASE_URL)


class AgentRunRequest(BaseModel):
    session_id: str
    new_message: types.Content
    streaming: bool = True


router = APIRouter()
session_service = DatabaseSessionService(db_url=DATABASE_URL)


@router.post("/run")
async def agent_run(req: AgentRunRequest):
    root_agent = get_agent()
    user_id = "1"
    runner = Runner(
        app_name=APP_NAME, agent=root_agent, session_service=session_service
    )

    session = await runner.session_service.get_session(
        app_name=APP_NAME, user_id=user_id, session_id=req.session_id
    )

    if not session:
        session = await runner.session_service.create_session(
            app_name=APP_NAME, user_id=user_id, session_id=req.session_id
        )

    if req.streaming:
        config = RunConfig(streaming_mode=StreamingMode.SSE)

        async def event_generator():
            async for event in runner.run_async(
                user_id=user_id,
                session_id=req.session_id,
                new_message=req.new_message,
                run_config=config,
            ):
                sse_event = event.model_dump_json(exclude_none=True, by_alias=True)
                yield f"data: {sse_event}\n\n"

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
        )

    else:

        events = [
            event
            async for event in runner.run_async(
                user_id=user_id,
                session_id=req.session_id,
                new_message=req.new_message,
            )
        ]

        return events


@router.get("/sessions")
async def get_sessions():
    user_id = "1"
    list_sessions_response = await session_service.list_sessions(
        app_name=APP_NAME, user_id=user_id
    )

    return list_sessions_response


@router.get("/session/{session_id}")
async def get_session(session_id: str):
    user_id = "1"
    session = await session_service.get_session(
        app_name=APP_NAME, user_id=user_id, session_id=session_id
    )

    if not session:
        return JSONResponse(
            status_code=404,
            content={"message": f"Session with ID {session_id} not found"},
        )
    
    return session.events
