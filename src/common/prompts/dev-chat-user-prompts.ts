import { createUserParametrizedPromptForConversation, Prompt, PromptCategory } from '@/common/prompts/prompts';

const userParametrizedPromptResearchTaskResearch = `
I am about to undertake a development task that involves {{describe_the_task_and_problem}}.
My goal is to {{describe_the_specific_goal_or_question_related_to_the_action}}.
Could you help me define the functional aspects and the fundamental code structure necessary to successfully complete this task?
`.trim();
const userParametrizedPromptResearchTaskBreakdownStructure = `
I am about to break down a development task that involves {{describe_the_task_and_problem}}.
Before proceeding, I need to ensure a comprehensive decomposition into smaller, manageable subtasks.
Based on the functional aspects and components identified during the task research phase, please help me effectively decompose this task.
What key subtasks should be included? Are there any specific functionalities that can be treated as separate subtasks?
`.trim();
const userParametrizedPromptResearchTaskBreakdownOverview = `
I am planning to break down a development task involving {{describe_the_task_and_problem}}.
Could you first provide an overview of the key components and functional aspects identified during the task research phase?
`.trim();
const userParametrizedPromptResearchSubtaskIdentification = `
Based on the overview provided, what key subtasks can we identify that are necessary to complete the main task of {{describe_the_task}}? Please list each subtask with a brief description.
`.trim();
const userParametrizedPromptResearchFunctionalitySegregation = `
Are there specific functionalities within the main task that can be treated as separate subtasks? Please describe each and explain why it should be considered a standalone subtask.
`.trim();
const userParametrizedPromptResearchTaskDependencySpecification = `
For the subtasks identified, can you specify any dependencies among them? Understanding these dependencies will help in planning the execution order.
`.trim();
const userParametrizedPromptResearchFeedbackMechanismSetup = `
Each subtask should be valuable on its own.
How can we set up a feedback mechanism for each subtask to collect user feedback and use it to improve the functionality?
`.trim();
const userParametrizedPromptResearchTaskHierarchyCreation = `
I am in the process of organizing subtasks hierarchically for a development task that involves {{describe_the_task_and_problem}}.
To ensure efficient task completion, I aim to create a clear and effective hierarchy of tasks.
Could you guide me on how to organize these subtasks into a hierarchical structure? Additionally, are there any particular subtasks that are foundational and should be tackled first?
`.trim();
const userParametrizedPromptResearchSubtasksOverview = `
I am working on a development task involving {{describe_the_task_and_problem}}.
Before organizing the subtasks into a hierarchy, could you provide a brief overview of all identified subtasks based on the task decomposition?
`.trim();
const userParametrizedPromptResearchHierarchyOrganization = `
Based on the subtasks overview provided, how should I organize these subtasks into a hierarchical structure? What criteria should I use to determine the order and grouping of these subtasks?
`.trim();
const userParametrizedPromptResearchFoundationalSubtaskIdentification = `
Among the subtasks listed, are there any that are particularly foundational and should be addressed first? Please identify these subtasks and explain why they are critical to start with.
`.trim();
const userParametrizedPromptResearchResourceAssignment = `
Given the hierarchical structure we've discussed, how should resources be assigned to ensure efficient progress? Are there specific subtasks that require more resources or specialized skills?
`.trim();
const userParametrizedPromptResearchProgressMeasurement = `
What methods or metrics would you recommend for measuring the progress of each subtask within the hierarchy? How can we effectively track and report on the development process?
`.trim();
const userParametrizedPromptResearchDependencySpecification = `
I am in the process of specifying dependencies for a development task that involves {{describe_the_task_and_problem}}.
To ensure a smooth workflow, I need to establish the correct order for completing subtasks based on their dependencies.
Could you guide me on how to determine the order in which to complete these subtasks? Additionally, are there any subtasks that can be parallelized or worked on simultaneously?
`.trim();
const userParametrizedPromptResearchSubtasksAndDependenciesOverview = `
I am working on a development task involving {{describe_the_task_and_problem}}.
Before specifying the order of subtasks based on dependencies, could you provide a brief overview of all identified subtasks and any known dependencies among them?
`.trim();
const userParametrizedPromptResearchDependencyBasedOrderDetermination = `
Based on the overview of subtasks and dependencies provided, how should I determine the optimal order in which to complete these subtasks? What criteria should I use to establish this sequence?
`.trim();
const userParametrizedPromptResearchParallelizableSubtaskIdentification = `
Considering the dependencies and the order of subtasks you've outlined, are there any subtasks that can be parallelized or worked on simultaneously? Please identify these subtasks and explain why they can be handled concurrently.
`.trim();
const userParametrizedPromptResearchDependencyImpactAssessment = `
Can you assess the impact of these dependencies on the overall project timeline? How might delays in one subtask affect the completion of subsequent subtasks?
`.trim();
const userParametrizedPromptResearchBottleneckAdjustmentRecommendations = `
If there are potential bottlenecks due to dependencies, what adjustments would you recommend to minimize delays and ensure smoother workflow?
`.trim();
const userParametrizedPromptResearchPositiveScenarioIdentification = `
I am developing a new feature {{describe_the_feature}} for {{describe_the_application_or_system}}.
The feature involves {{describe_what_the_feature_does}}.
Please help me identify all possible positive scenarios where this feature enhances {{mention_specific_benefits}}.
`.trim();
const userParametrizedPromptResearchNegativeScenarioIdentification = `
I am implementing a new feature {{describe_the_feature}} for {{describe_the_application_or_system}}.
Before proceeding, I need to identify all potential negative scenarios where this feature might {{describe_potential_failures_or_issues}}.
Could you help outline these scenarios?
`.trim();
const userParametrizedPromptResearchEdgeCaseIdentification = `
I'm about to enhance/add {{describe_the_feature}} to our {{describe_the_application_or_system}}.
Before finalizing, I need to identify all potential edge cases that could affect {{mention_specific_aspects}}.
What unusual input values or scenarios should I consider? How should the application handle unexpected or erroneous data?
`.trim();
const userParametrizedPromptResearchCodeSnippetGeneration = `
I am working on a development subtask {{describe_the_subtask}} and need to explore similar solutions since this is new to me.
Could you help me generate examples of potential solutions in {{specify_programming_language_or_technology}} that align with this task? Additionally, how can I ensure these solutions are relevant to my specific requirements? What common patterns or approaches should I look for, and what steps should I take to customize and integrate these solutions effectively?
`.trim();
const userParametrizedPromptResearchSolutionGeneration = `
I am working on a development subtask {{describe_the_subtask}}.
Since I am unfamiliar with this area, could you generate examples of potential solutions in {{specify_programming_language_or_technology}} that align with this task?
`.trim();
const userParametrizedPromptResearchSolutionRelevanceConfirmation = `
Given the solutions you've provided for {{describe_the_subtask}}, how can I ensure these solutions are relevant to my specific requirements? Are there particular aspects I should verify or adjust?
`.trim();
const userParametrizedPromptResearchCommonCodePatternAnalysis = `
Can you help me identify common patterns or design approaches in the code snippets provided for {{describe_the_subtask}}? What should I look for that could be beneficial for integrating these solutions into my project?
`.trim();
const userParametrizedPromptResearchCodeCustomizationGuidance = `
What steps should I take to customize the provided solutions to fit the specific requirements of {{describe_the_subtask}}? Are there any best practices for modifying existing code to better suit new contexts?
`.trim();
const userParametrizedPromptResearchIntegrationAndAccuracyCheck = `
Once I have customized the solutions for {{describe_the_subtask}}, how can I ensure that the integration into the existing system remains accurate and coherent? Are there strategies or checks I should employ?
`.trim();
const userParametrizedPromptCodeGenerationNewFunctionCreation = `
Please generate a {{programming_language}} function that {{describe_the_function_purpose}}.
The function should take {{list_input_parameters_and_their_types}} as input and return {{describe_the_expected_return_value_and_type}}.
The method should follow these key steps: {{describe_key_steps_or_algorithmic_details}}.
Ensure that the code aligns with best practices and is suitable for reuse in similar contexts.
`.trim();
const userParametrizedPromptCodeGenerationNewClassCreation = `
Generate a {{programming_language}} class named {{class_service_name}} designed for {{describe_the_purpose_or_functionality}}.
This class should include attributes such as {{list_key_attributes_or_methods}} and methods that {{describe_what_the_methods_should_do}}.
It should interact with {{describe_interaction_with_other_classes_services}} and adhere to {{mention_specific_design_patterns_or_architectural_principles}}.
Ensure the class maintains clear separation of concerns and provides maintainable and readable code.
`.trim();
const userParametrizedPromptCodeGenerationNewModuleCreation = `
As a {{programming_language}} developer, I need assistance creating a new module/project designed for {{describe_the_purpose_and_functionality}}.
This module should integrate {{list_specific_libraries_or_frameworks}}.
Please provide an initial code structure that includes the necessary classes and methods, and adheres to {{mention_any_relevant_design_patterns}}.
Ensure the code is structured to allow for easy maintenance and scalability.
`.trim();
const userParametrizedPromptRefactoringCodeSmellIdentification = `
Please review the following code snippet in {{programming_language}} and identify any code smells or areas that may require refactoring.
This code is part of a {{brief_description_of_the_project}} and is responsible for {{brief_description_of_the_functionality}}.
Here is the code snippet:
\`\`\`
{{the_code_snippet}}
\`\`\`
Let me know if you need any additional context or details.
`.trim();
const userParametrizedPromptRefactoringPlanCreation = `
I have identified the following code smells in my {{programming_language}} code and would like your help creating a refactoring plan to address these issues: {{list_of_code_smells}}.
This code is part of a {{brief_description_of_the_project}} and is responsible for {{brief_description_of_the_functionality}}.
Here's a sample code snippet for reference:
\`\`\`
{{the_code_snippet}}
\`\`\`
Please suggest a step-by-step refactoring plan, including appropriate techniques or design patterns, and any additional considerations for ensuring a safe and effective refactoring process.
`.trim();
const userParametrizedPromptRefactoringSimpleRefactorExecution = `
Refactor the following {{programming_language}} code snippet, which is part of a {{brief_description_of_the_project}} and is responsible for {{brief_description_of_the_functionality}}.
The main goal of the refactoring is to {{refactoring_goal}}.
Here is the code snippet:
\`\`\`
{{the_code_snippet}}
\`\`\`
Please provide a step-by-step explanation for each refactoring step, including the techniques or design patterns used, and any additional considerations for ensuring a safe and effective refactoring process.
`.trim();
const userParametrizedPromptRefactoringComplexRefactorExecution = `
Refactor the following {{programming_language}} code snippet, which is part of a {{brief_description_of_the_project}} and is responsible for {{brief_description_of_the_functionality}}.
The main refactoring goal is to {{refactoring_goal}}.
Please suggest suitable design pattern(s) to address this goal and provide a step-by-step guide on how to refactor the code using the suggested design pattern(s), including any additional considerations for ensuring a safe and effective refactoring process.
Here is the code snippet:
\`\`\`
{{the_code_snippet}}
\`\`\`
If you have a specific design pattern in mind, please apply it to the code.
If not, suggest a suitable pattern based on the code's context and requirements.
`.trim();
const userParametrizedPromptTestingUnitTestsCreation = `
Create a set of test cases to ensure the code below is thoroughly tested, considering that the code implements {{code_explanation}}.
Then, generate unit tests for these test cases in {{language_and_testing_framework}}.
Here is the function code:
\`\`\`
{{function_code}}
\`\`\`

Explanation: {{brief_explanation_of_code_functionality}}

Specific Requirements: {{specific_requirements_or_environmental_constraints}}

Please ensure the unit tests cover all possible scenarios and edge cases, and adjust the response precision to ensure focused and deterministic outcomes.
`.trim();
const userParametrizedPromptTestingUnitTestsMaintenance = `
I have updated my function code to include new functionality.
Please update the test cases and unit tests to cover these changes.
Ensure that the updated test cases and unit tests follow the provided code style and conventions.
Explain what was updated and why.
Here is the updated function code and the previous tests:

Updated Function Code:
\`\`\`
{{updated_function_code}}
\`\`\`

Previous Tests:
\`\`\`
{{previous_tests}}
\`\`\`

Please review both the updated function code and the previous tests to ensure comprehensive coverage and alignment with the latest functionality.
Explain the updates made to the test cases and the reasons for these changes.
`.trim();
const userParametrizedPromptTestingTestDataGeneration = `
Generate test data in {{data_format}} to create an array of {{array_length}} objects based on the following model:

\`\`\`
{{model_details_or_code_snippet}}
\`\`\`

Data Format: {{data_format}}

Array Length: {{array_length}}

Model Details: {{object_structure_and_attribute_types}}

Please ensure that the generated test data accurately reflects the structure and types specified in the model details, and is suitable for use in testing the functionality of the system.
`.trim();
const userParametrizedPromptTestingTestDataSourceCodeGeneration = `
Generate a {{programming_language}} code snippet to create an array of {{number}} {{object_type}} objects with test data, adhering to the following model and constraints:

\`\`\`{{programming_language}}
class {{object_type}} {
    {{list_object_attributes_and_types}}
    
    public {{object_type}}({{constructor_parameters}}) {
        {{constructor_initialization}}
    }
}
\`\`\`

Constraints:
- {{list_specific_constraints}}

Please ensure the generated test data is diverse and realistic, considering the specified constraints.
Use domain-specific knowledge to create data that resembles real-world examples in the {{specific_domain_or_industry}}.
`.trim();
const userParametrizedPromptTestingTestDataUpdate = `
Please update the existing test data according to the newly updated data model provided below.
Ensure the test data accurately reflects the changes and explain what was updated and why.

Updated Model Description:

\`\`\`
{{updated_model_description_or_code_snippet}}
\`\`\`

Existing Test Data:

\`\`\`
{{existing_test_data_or_code_snippet}}
\`\`\`

Changes Required:
- {{list_of_changes_required}}

Explanation Requirement:
- Provide detailed explanations for each update made to help understand the modifications and their purposes.

Ensure the updated test data is comprehensive and aligns with the new model specifications.
`.trim();
const userParametrizedPromptDocumentationInlineCommentGeneration = `
Please generate {{type_of_comments}} comments for the following code snippet.
This code implements {{brief_description_of_code_functionality}}.
Provide clear and concise language to ensure the comments are easy to understand.

Type of Comments: {{type_of_comments}}
Code Snippet:

\`\`\`
{{code_snippet}}
\`\`\`

Information About the Code and Its Algorithms:
{{detailed_explanation_of_code_and_algorithms}}

Your assistance will help in understanding the code better and ensuring that the generated comments accurately reflect the code's functionality and logic.
`.trim();
const userParametrizedPromptDocumentationCodeDocumentationGeneration = `
Please generate {{type_of_comments}} comments for the following code snippet.
This code implements {{brief_description_of_code_functionality}}.
Provide clear and concise language to ensure the comments are easy to understand.

Type of Comments: {{type_of_comments}}
Code Snippet:

\`\`\`
{{code_snippet}}
\`\`\`

Information About the Code and Its Algorithms:
{{detailed_explanation_of_code_and_algorithms}}

Your assistance will help in understanding the code better and ensuring that the generated comments accurately reflect the code's functionality and logic.
`.trim();

export const userConversationPrompts: Prompt[] = [
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchTaskResearch',
        userParametrizedPromptResearchTaskResearch,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Research the task and problem to define functional aspects and code structure.',
        'task',
        'research',
        'development',
        'problem analysis',
        'code structure',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchTaskBreakdownStructure',
        userParametrizedPromptResearchTaskBreakdownStructure,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Break down the development task into smaller, manageable subtasks based on identified functional aspects.',
        'task',
        'breakdown',
        'decomposition',
        'subtasks',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchTaskBreakdownOverview',
        userParametrizedPromptResearchTaskBreakdownOverview,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Provide an overview of key components and functional aspects identified during task research.',
        'overview',
        'task',
        'research',
        'components',
        'functional aspects',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchSubtaskIdentification',
        userParametrizedPromptResearchSubtaskIdentification,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Identify key subtasks necessary to complete the main development task.',
        'subtask',
        'identification',
        'development',
        'task breakdown',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchFunctionalitySegregation',
        userParametrizedPromptResearchFunctionalitySegregation,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Identify functionalities that can be treated as standalone subtasks.',
        'functionality',
        'segregation',
        'modularization',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchTaskDependencySpecification',
        userParametrizedPromptResearchTaskDependencySpecification,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Specify dependencies among subtasks to determine execution order.',
        'dependencies',
        'task',
        'planning',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchFeedbackMechanismSetup',
        userParametrizedPromptResearchFeedbackMechanismSetup,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Set up feedback mechanisms for each subtask to improve functionality.',
        'feedback',
        'mechanism',
        'subtask',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchTaskHierarchyCreation',
        userParametrizedPromptResearchTaskHierarchyCreation,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Organize subtasks hierarchically for efficient task completion.',
        'hierarchy',
        'task',
        'organization',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchSubtasksOverview',
        userParametrizedPromptResearchSubtasksOverview,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Provide an overview of all identified subtasks before organizing them hierarchically.',
        'subtasks',
        'overview',
        'development',
        'task breakdown',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchHierarchyOrganization',
        userParametrizedPromptResearchHierarchyOrganization,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Guide on organizing subtasks into a hierarchical structure with grouping criteria.',
        'organization',
        'hierarchy',
        'subtasks',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchFoundationalSubtaskIdentification',
        userParametrizedPromptResearchFoundationalSubtaskIdentification,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Identify foundational subtasks critical to start with in the hierarchy.',
        'foundational',
        'subtask',
        'priority',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchResourceAssignment',
        userParametrizedPromptResearchResourceAssignment,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Assign resources to subtasks for efficient progress and identify skill requirements.',
        'resources',
        'assignment',
        'development',
        'planning',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchProgressMeasurement',
        userParametrizedPromptResearchProgressMeasurement,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Recommend methods and metrics for measuring subtask progress.',
        'progress',
        'measurement',
        'tracking',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchDependencySpecification',
        userParametrizedPromptResearchDependencySpecification,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Specify dependencies and determine execution order of subtasks.',
        'dependencies',
        'task',
        'planning',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchSubtasksAndDependenciesOverview',
        userParametrizedPromptResearchSubtasksAndDependenciesOverview,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Provide an overview of subtasks and known dependencies.',
        'subtasks',
        'dependencies',
        'overview',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchDependencyBasedOrderDetermination',
        userParametrizedPromptResearchDependencyBasedOrderDetermination,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Determine the optimal order of subtasks based on dependencies.',
        'order',
        'dependency',
        'planning',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchParallelizableSubtaskIdentification',
        userParametrizedPromptResearchParallelizableSubtaskIdentification,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Identify subtasks that can be parallelized based on dependencies.',
        'parallelization',
        'subtask',
        'optimization',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchDependencyImpactAssessment',
        userParametrizedPromptResearchDependencyImpactAssessment,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Assess the impact of dependencies on the project timeline.',
        'impact',
        'dependency',
        'timeline',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchBottleneckAdjustmentRecommendations',
        userParametrizedPromptResearchBottleneckAdjustmentRecommendations,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Recommend adjustments to minimize bottlenecks caused by dependencies.',
        'bottlenecks',
        'adjustments',
        'optimization',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchPositiveScenarioIdentification',
        userParametrizedPromptResearchPositiveScenarioIdentification,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Identify positive scenarios where the feature enhances specific benefits.',
        'positive',
        'scenario',
        'feature',
        'benefits',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchNegativeScenarioIdentification',
        userParametrizedPromptResearchNegativeScenarioIdentification,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Identify negative scenarios where the feature may fail or cause issues.',
        'negative',
        'scenario',
        'feature',
        'failure',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchEdgeCaseIdentification',
        userParametrizedPromptResearchEdgeCaseIdentification,
        PromptCategory.TASK_RESEARCH_PROMPT,
        'Identify edge cases that may affect specific aspects of the feature.',
        'edge',
        'case',
        'unusual',
        'input',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchCodeSnippetGeneration',
        userParametrizedPromptResearchCodeSnippetGeneration,
        PromptCategory.CODE_GENERATION,
        'Generate code examples for a development subtask and guide customization.',
        'code',
        'snippet',
        'generation',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchSolutionGeneration',
        userParametrizedPromptResearchSolutionGeneration,
        PromptCategory.CODE_GENERATION,
        'Generate potential solutions for a development subtask in a specified language.',
        'solution',
        'generation',
        'development',
        'code',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchSolutionRelevanceConfirmation',
        userParametrizedPromptResearchSolutionRelevanceConfirmation,
        PromptCategory.CODE_GENERATION,
        'Confirm the relevance of provided solutions to the specific subtask requirements.',
        'relevance',
        'solution',
        'verification',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchCommonCodePatternAnalysis',
        userParametrizedPromptResearchCommonCodePatternAnalysis,
        PromptCategory.CODE_GENERATION,
        'Identify common patterns in provided code snippets for integration purposes.',
        'pattern',
        'analysis',
        'code',
        'integration',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchCodeCustomizationGuidance',
        userParametrizedPromptResearchCodeCustomizationGuidance,
        PromptCategory.CODE_GENERATION,
        'Guide on customizing solutions to fit specific subtask requirements.',
        'customization',
        'code',
        'guidance',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptResearchIntegrationAndAccuracyCheck',
        userParametrizedPromptResearchIntegrationAndAccuracyCheck,
        PromptCategory.CODE_GENERATION,
        'Ensure accuracy and coherence when integrating customized solutions.',
        'integration',
        'accuracy',
        'code',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptCodeGenerationNewFunctionCreation',
        userParametrizedPromptCodeGenerationNewFunctionCreation,
        PromptCategory.CODE_GENERATION,
        'Generate a new function/method in a specified programming language.',
        'function',
        'generation',
        'code',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptCodeGenerationNewClassCreation',
        userParametrizedPromptCodeGenerationNewClassCreation,
        PromptCategory.CODE_GENERATION,
        'Generate a new class in a specified programming language with required attributes and methods.',
        'class',
        'generation',
        'code',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptCodeGenerationNewModuleCreation',
        userParametrizedPromptCodeGenerationNewModuleCreation,
        PromptCategory.CODE_GENERATION,
        'Create a new module/project with an initial structure and libraries.',
        'module',
        'generation',
        'code',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptRefactoringCodeSmellIdentification',
        userParametrizedPromptRefactoringCodeSmellIdentification,
        PromptCategory.CODE_REFACTORING,
        'Identify code smells in a provided code snippet.',
        'code',
        'smell',
        'refactoring',
        'analysis',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptRefactoringPlanCreation',
        userParametrizedPromptRefactoringPlanCreation,
        PromptCategory.CODE_REFACTORING,
        'Create a step-by-step plan for refactoring code with identified smells.',
        'refactoring',
        'plan',
        'development',
        'strategy',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptRefactoringSimpleRefactorExecution',
        userParametrizedPromptRefactoringSimpleRefactorExecution,
        PromptCategory.CODE_REFACTORING,
        'Execute a simple refactoring with step-by-step explanation.',
        'simple',
        'refactoring',
        'execution',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptRefactoringComplexRefactorExecution',
        userParametrizedPromptRefactoringComplexRefactorExecution,
        PromptCategory.CODE_REFACTORING,
        'Execute a complex refactoring using design patterns.',
        'complex',
        'refactoring',
        'design pattern',
        'development',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptTestingUnitTestsCreation',
        userParametrizedPromptTestingUnitTestsCreation,
        PromptCategory.TEST_GENERATION,
        'Generate unit tests for a provided function.',
        'unit',
        'test',
        'generation',
        'coverage',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptTestingUnitTestsMaintenance',
        userParametrizedPromptTestingUnitTestsMaintenance,
        PromptCategory.TEST_GENERATION,
        'Update existing unit tests to reflect new functionality.',
        'update',
        'test',
        'maintenance',
        'coverage',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptTestingTestDataGeneration',
        userParametrizedPromptTestingTestDataGeneration,
        PromptCategory.TEST_GENERATION,
        'Generate test data in a specified format and length.',
        'test',
        'data',
        'generation',
        'format',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptTestingTestDataSourceCodeGeneration',
        userParametrizedPromptTestingTestDataSourceCodeGeneration,
        PromptCategory.TEST_GENERATION,
        'Generate code to create test data objects.',
        'source',
        'code',
        'test data',
        'generation',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptTestingTestDataUpdate',
        userParametrizedPromptTestingTestDataUpdate,
        PromptCategory.TEST_GENERATION,
        'Update existing test data based on a new model.',
        'update',
        'test data',
        'model',
        'migration',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptDocumentationInlineCommentGeneration',
        userParametrizedPromptDocumentationInlineCommentGeneration,
        PromptCategory.CODE_DOCUMENTATION,
        'Generate inline comments for a code snippet.',
        'inline',
        'comment',
        'documentation',
        'code',
    ),
    createUserParametrizedPromptForConversation(
        'userParametrizedPromptDocumentationCodeDocumentationGeneration',
        userParametrizedPromptDocumentationCodeDocumentationGeneration,
        PromptCategory.CODE_DOCUMENTATION,
        'Generate documentation for a code snippet.',
        'documentation',
        'code',
        'generation',
        'comments',
    ),
];
