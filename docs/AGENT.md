# LLM-powered Agent (ReAct)

## What is the Agent (ReAct) ?

An Agent is an advanced AI system that utilizes large language models (LLMs) as its central computational engine. It combines the reasoning capabilities of LLMs with additional functionalities such as planning and tool usage to autonomously perform complex tasks. Agents can break down complicated queries, generate step-by-step solutions, and interact with external tools or APIs to gather information or execute subtasks.

This sample implements an Agent using the ReAct (Reasoning + Acting) approach. ReAct enables the agent to solve complex tasks by combining reasoning and actions in an iterative feedback loop. The agent repeatedly goes through three key steps: Thought, Action, and Observation. It analyzes the current situation using the LLM, decides on the next action to take, executes the action using available tools or APIs, and learns from the observed results. This continuous process allows the agent to adapt to dynamic environments, improve its task-solving accuracy, and provide context-aware solutions.

## To use the Agent feature

To enable the Agent functionality for your customized chatbot, follow these steps:

1. Navigate to the Agent section in the custom bot screen.

2. In the Agent section, you will find a list of available tools that can be used by the Agent. By default, all tools are disabled.

3. To activate a tool, simply toggle the switch next to the desired tool. Once a tool is enabled, the Agent will have access to it and can utilize it when processing user queries.

TODO
Screenshot

4. The sample implementation provides a default "Weather Retrieval" tool. This tool allows the Agent to fetch weather information when necessary to answer user questions related to weather conditions.

TODO
conversation with weather tool

5. You can develop and add your own custom tools to extend the capabilities of the Agent. Refer to the [How to develop your own tools](#how-to-develop-your-own-tools) section for more information on creating and integrating custom tools.

> [!Info]
> It's important to note that enabling any tool in the Agent section will automatically treat the Knowledge-based RAG (Retrieval-Augmented Generation) functionality as a tool as well. This means that the LLM will autonomously determine whether to use the knowledge base to answer user queries, considering it as one of the available tools at its disposal.

## How to develop your own tools

To develop your own custom tools for the Agent, follow these guidelines:

- Create a new class that inherits from the `BaseTool` class. Although the interface is compatible with LangChain, this sample implementation provides its own `BaseTool` class, which you should inherit from.
  TODO: path to basetool

- Refer to the sample implementation of a [BMI calculation tool](../examples/agents/tools/bmi.py). This example demonstrates how to create a tool that calculates the Body Mass Index (BMI) based on user input.

- Once you have implemented your custom tool, it's recommended to verify its functionality using test script ([example](../backend/tests/test_agent/test_tools/test_weather.py)). This script will help you ensure that your tool is working as expected.

- After completing the development and testing of your custom tool, move the implementation file to the [backend/app/agents/tools/](../backend/app/agents/tools/) directory. Then open [backend/app/agents/utils.py](../backend/app/agents/utils.py) and edit `get_available_tools` so that the user can select the tool developed.

- Run `cdk deploy` to deploy your changes. This will make your custom tool available in the custom bot screen.

TODO: screenshot for bmi tool

In addition to the BMI calculation example, there are other tool examples available for reference. Feel free to explore these examples to gain insights and inspiration for creating your own tools.

Contributions to the tool repository are welcome! If you develop a useful and well-implemented tool, consider contributing it to the project by submitting a pull request.
