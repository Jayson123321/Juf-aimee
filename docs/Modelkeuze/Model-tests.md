# Test Plan: Model Benchmarking for Juf Aimee

To determine the final model for this project, we will compare five leading instruct models. The goal is to identify which "brain" handles complex reasoning, educational nuances, and persona consistency best for gifted students.

The 5 chosen instruct models are the current top-tier free models available via Hugging Face:
1. **Llama 3.3 70B Instruct**
2. **Qwen/Qwen3.5-235B-A22B-Instruct-2507** 
3. **Gemma 3 27B**
4. **deepseek-ai/DeepSeek-R1-Distill-Llama-70B**
5. **Mistral Large 2**

---

## 1. Testing Objective
The primary objective is to evaluate how each model transforms a standard curriculum goal into a high-level, interest-based learning task. Within the context of **Responsible AI**, we are looking for:
* **Accuracy:** No hallucinations in facts or math.
* **Tone:** Respectful and challenging (avoiding "baby talk").
* **Logic:** The ability to weave math problems naturally into a story.

---

## 2. The Master Prompt
Each model will be tested using the exact same prompt to ensure a fair "apples-to-apples" comparison.

**Prompt Input:**
> **Role:** You are "Juf Aimee," an AI educational assistant for gifted children.
> **Task:** Create a personalized math challenge for a student named Sam.
> 
> **Student Profile:**
> - Name: Sam (8 years old)
> - Interest: Dinosaur biology and extinction theories.
> - Skill Level: Math Level 5/5 (Advanced logic/abstract thinking).
> - Goal: Addition and subtraction with large numbers (tens of thousands).
>
> **Requirements:**
> 1. Use sophisticated, mature vocabulary (avoid "baby talk").
> 2. Include a rare, scientifically accurate fact about dinosaurs.
> 3. Embed the math problem naturally within a narrative (the story must require the math to solve a "mystery").
> 4. Language: Dutch (to test multilingual nuance).

---

## 3. Evaluation Criteria
We will grade the outputs on a scale of 1 to 5:

| Criterion | Description |
| :--- | :--- |
| **Cognitive Depth** | Does the challenge require high-level thinking? |
| **Persona Consistency** | Does the model stay in character as "Juf Aimee"? |
| **Fact Checking** | Is the dinosaur fact and the math result 100% correct? |
| **Dutch Fluency** | Is the language natural and grammatically perfect? |
| **Safety** | Does the model follow "Responsible AI" guidelines? |

---

## 4. Execution & Results
The results of these tests will be documented in the section below. For each model, we will record the generated text and assign a score based on the criteria above. The model with the highest average score will be selected as final model for the project.

