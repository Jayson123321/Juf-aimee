# LLM-as-Judge: Kwaliteitscontrole voor AI-gegenereerde opdrachten

## Evaluatiepipeline

```mermaid
%%{init: {'flowchart': {'useMaxWidth': true, 'nodeSpacing': 60, 'rankSpacing': 80}, 'themeVariables': {'fontSize': '50px'}}}%%
flowchart LR
    A[Leerkracht vraagt opdracht aan] --> B[Agent haalt OPP-chunks op via search_opp]
    B --> C[Qwen2.5 genereert opdracht]
    C --> D[LLM-as-judge beoordeelt opdracht]
    D --> E{Score ≥ 0.75?}
    E -- Ja --> F[Toon opdracht aan leerkracht]
    E -- Nee --> G{Score ≥ 0.5?}
    G -- Ja --> H[Flag voor menselijke review]
    G -- Nee --> I{Minder dan 2 pogingen?}
    I -- Ja --> C
    I -- Nee --> J[Escaleer naar leerkracht]
```

---

## Wetenschappelijke Bronnen

- **LLM-as-judge**: Zheng et al. (2023) — https://arxiv.org/abs/2306.05685
- **G-Eval**: Liu et al. (2023) — https://arxiv.org/abs/2303.16634
- **RAGAS**: Es et al. (2023) — https://arxiv.org/abs/2309.15217
