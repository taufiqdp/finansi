import os
from typing import List, Union

from dotenv import load_dotenv
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from google.adk.cli.utils.common import BaseModel
from google.adk.events.event import Event
from google.adk.runners import Runner
from google.adk.sessions import DatabaseSessionService
from google.genai import types

from financial_agent.agent import get_agent

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
APP_NAME = os.getenv("APP_NAME")


class AgentRunRequest(BaseModel):
    user_id: str
    session_id: str
    new_message: types.Content
    streaming: bool = False


router = APIRouter(prefix="/api", tags=["agent_run"])

session_service = DatabaseSessionService(db_url=DATABASE_URL)


@router.post("/run")
async def agent_run(req: AgentRunRequest) -> Union[List[Event], StreamingResponse]:
    root_agent = get_agent(user_id=req.user_id)
    runner = Runner(
        app_name=APP_NAME, agent=root_agent, session_service=session_service
    )

    session = await runner.session_service.get_session(
        app_name=APP_NAME, user_id=req.user_id, session_id=req.session_id
    )

    if not session:
        session = await runner.session_service.create_session(
            app_name=APP_NAME, user_id=req.user_id, session_id=req.session_id
        )

    if req.streaming:

        async def event_generator():
            try:
                async for event in runner.run_async(
                    user_id=req.user_id,
                    session_id=req.session_id,
                    new_message=req.new_message,
                ):
                    sse_event = event.model_dump_json(exclude_none=True, by_alias=True)
                    yield f"data: {sse_event}\n\n"
            except Exception as e:
                yield [f"data: {{'error': '{str(e)}'}}\n\n"]

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
        )

    else:
        try:
            events = [
                event
                async for event in runner.run_async(
                    session_id=req.session_id,
                    user_id=req.user_id,
                    new_message=req.new_message,
                )
            ]

            return events
        except Exception as e:
            return [{"error": str(e)}]
