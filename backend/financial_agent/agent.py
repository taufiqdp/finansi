from dotenv import load_dotenv
from google.adk.agents import Agent

from financial_agent.prompt import INSTRUCTION
from financial_agent.tools import execute_sql_query

load_dotenv()


root_agent = Agent(
    name="financial_agent",
    model="gemini-2.0-flash",
    tools=[
        execute_sql_query,
    ],
    instruction=INSTRUCTION,
)
