from dotenv import load_dotenv
from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm

from agent.prompt import get_prompt
from agent.tools import execute_sql_query, get_balance

load_dotenv()


def get_agent() -> Agent:
    return Agent(
        name="financial_agent",
        model=LiteLlm(model="azure/gpt-4o-mini"),
        tools=[execute_sql_query, get_balance],
        instruction=get_prompt(),
    )


root_agent = get_agent()  # For testing purposes
