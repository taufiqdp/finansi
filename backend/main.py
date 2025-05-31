import asyncio

from financial_agent.agent import create_agent


async def main():
    await create_agent()


if __name__ == "__main__":
    asyncio.run(main())
