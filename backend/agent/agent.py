from dotenv import load_dotenv
from financial_agent.prompt import get_prompt
from financial_agent.tools import execute_sql_query, get_balance
from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm

load_dotenv()


def get_agent(user_id: int) -> Agent:
    return Agent(
        name="financial_agent",
        model=LiteLlm(model="azure/gpt-4o-mini"),
        tools=[execute_sql_query, get_balance],
        instruction=get_prompt(user_id=user_id),
    )


root_agent = get_agent(user_id=1)  # For testing purposes
