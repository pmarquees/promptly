import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

const TEST_EMAIL = "test@promptly.local";
const TEST_PASSWORD = "PromptlyTest2026!";

const promptFixtures = [
  {
    name: "Customer Support — Empathetic Resolution",
    description: "Turns a support ticket into a concise, human response with a clear next step.",
    tags: ["support", "customer-success", "production"],
    variables: ["customer_name", "issue", "account_context", "policy"],
    contents: [
      "Write a helpful reply to {{customer_name}} about {{issue}}. Use {{account_context}} and follow {{policy}}. Acknowledge the frustration, explain the resolution, and end with one clear next step.",
      "You are a senior customer advocate. Resolve {{issue}} for {{customer_name}} using {{account_context}} and {{policy}}. Be warm, specific, and concise. Include: acknowledgement, resolution, owner, and expected timing.",
      "Draft a calm, high-trust support response for {{customer_name}}. Context: {{account_context}}. Problem: {{issue}}. Policy: {{policy}}. Avoid scripts and blame. Give the best available action now and set an honest expectation.",
    ],
  },
  {
    name: "Weekly Product Update",
    description: "Creates a crisp stakeholder update from raw team notes.",
    tags: ["product", "internal-comms", "weekly"],
    variables: ["week", "wins", "risks", "next_steps", "audience"],
    contents: [
      "Turn these notes into a weekly product update for {{audience}}. Week: {{week}}. Wins: {{wins}}. Risks: {{risks}}. Next: {{next_steps}}.",
      "Write an executive-ready update for {{audience}} covering {{week}}. Lead with outcomes from {{wins}}, state {{risks}} plainly, and close with the decisions or next steps in {{next_steps}}.",
      "Summarize {{week}} for {{audience}} in under 220 words. Use sections: Shipped, Learned, At risk, Next. Source material: {{wins}}; {{risks}}; {{next_steps}}. Prefer concrete evidence over activity.",
    ],
  },
  {
    name: "Release Notes Writer",
    description: "Converts technical changes into useful, natural release notes.",
    tags: ["release", "copywriting", "mobile"],
    variables: ["product", "changes", "audience", "tone"],
    contents: [
      "Write release notes for {{product}} from {{changes}}. Audience: {{audience}}. Tone: {{tone}}. Focus on user value.",
      "Turn {{changes}} into concise release notes for {{product}}. Write for {{audience}} in a {{tone}} voice. Group related improvements and omit implementation detail.",
      "Create a short What's New update for {{product}} using {{changes}}. Make it sound written by the product team, not marketing. Audience: {{audience}}. Tone: {{tone}}. Mention the most meaningful improvement first.",
    ],
  },
  {
    name: "Research Synthesis",
    description: "Finds patterns and decisions across interview or survey notes.",
    tags: ["research", "insights", "ux"],
    variables: ["research_question", "notes", "segment", "decision"],
    contents: [
      "Synthesize {{notes}} for the {{segment}} segment around {{research_question}}. Identify themes, evidence, and implications for {{decision}}.",
      "Analyze {{notes}} to answer {{research_question}} for {{segment}}. Separate observed evidence from inference. Rank themes by frequency and decision impact for {{decision}}.",
      "Act as a rigorous product researcher. From {{notes}}, produce: five findings, supporting evidence, contradictions, open questions, and a recommendation for {{decision}}. Scope the analysis to {{segment}} and {{research_question}}.",
    ],
  },
  {
    name: "SQL Analyst Copilot",
    description: "Generates safe, explainable analytics SQL from a business question.",
    tags: ["analytics", "sql", "data"],
    variables: ["question", "schema", "dialect", "constraints"],
    contents: [
      "Answer {{question}} using {{dialect}} SQL and this schema: {{schema}}. Respect {{constraints}}. Explain the query briefly.",
      "Write a read-only {{dialect}} query for {{question}} using {{schema}}. Constraints: {{constraints}}. Use explicit joins, guard division by zero, and state assumptions.",
      "You are an analytics engineer. Translate {{question}} into production-quality {{dialect}} SQL using {{schema}}. Apply {{constraints}}. Return assumptions, SQL, validation checks, and likely performance considerations.",
    ],
  },
  {
    name: "Incident Timeline & Update",
    description: "Produces a factual incident update without speculation.",
    tags: ["engineering", "incident", "operations"],
    variables: ["service", "events", "impact", "status", "next_update"],
    contents: [
      "Write an incident update for {{service}} from {{events}}. Impact: {{impact}}. Status: {{status}}. Next update: {{next_update}}.",
      "Create a factual status-page update for {{service}}. Use {{events}} and {{impact}}. Clearly separate confirmed facts from investigation. Current status: {{status}}. Promise the next update at {{next_update}}.",
      "Summarize the {{service}} incident for customers in plain language. Timeline: {{events}}. User impact: {{impact}}. Current state: {{status}}. Avoid blame and unsupported root-cause claims. Next communication: {{next_update}}.",
    ],
  },
  {
    name: "Sales Call Follow-up",
    description: "Drafts a personal follow-up grounded in the actual conversation.",
    tags: ["sales", "email", "follow-up"],
    variables: ["prospect", "company", "notes", "value", "next_step"],
    contents: [
      "Write a follow-up email to {{prospect}} at {{company}} using {{notes}}. Connect {{value}} to their needs and propose {{next_step}}.",
      "Draft a brief, personal follow-up for {{prospect}} at {{company}}. Reference two specifics from {{notes}}, explain {{value}} without hype, and make {{next_step}} easy to accept.",
      "Write a high-quality post-call email to {{prospect}}. Company: {{company}}. Notes: {{notes}}. Relevant value: {{value}}. Ask: {{next_step}}. Keep it under 150 words and avoid generic sales phrases.",
    ],
  },
  {
    name: "SEO Content Brief",
    description: "Creates an editorially useful search brief rather than keyword stuffing.",
    tags: ["seo", "editorial", "content"],
    variables: ["topic", "intent", "audience", "competitors", "product"],
    contents: [
      "Create a content brief about {{topic}} for {{audience}} with {{intent}} intent. Consider {{competitors}} and connect naturally to {{product}}.",
      "Build an evidence-led SEO brief for {{topic}}. Search intent: {{intent}}. Reader: {{audience}}. Identify gaps in {{competitors}}, a differentiated angle, outline, questions, and a natural role for {{product}}.",
      "Act as a senior editor. Create a publishable brief for {{topic}} aimed at {{audience}} and {{intent}}. Use {{competitors}} only to identify missing value. Include thesis, structure, original examples, internal-link ideas, and how {{product}} belongs without forcing it.",
    ],
  },
  {
    name: "Meeting Decision Extractor",
    description: "Separates decisions, owners, actions, and unresolved questions.",
    tags: ["meetings", "operations", "productivity"],
    variables: ["transcript", "meeting_name", "participants", "date"],
    contents: [
      "Extract decisions and action items from {{meeting_name}} on {{date}}. Participants: {{participants}}. Transcript: {{transcript}}.",
      "From {{transcript}}, summarize {{meeting_name}} held on {{date}} with {{participants}}. Return decisions, actions with owners and dates, risks, and open questions. Do not invent missing owners.",
      "Create an operational record from {{transcript}} for {{meeting_name}} ({{date}}; {{participants}}). Distinguish explicit decisions from proposals. For every action include owner, deadline, dependency, and confidence; mark unknown fields clearly.",
    ],
  },
  {
    name: "Code Review — Risk First",
    description: "Reviews a change for correctness, regressions, security, and missing tests.",
    tags: ["engineering", "code-review", "quality"],
    variables: ["language", "diff", "context", "requirements"],
    contents: [
      "Review this {{language}} change against {{requirements}}. Context: {{context}}. Diff: {{diff}}. Find concrete bugs and missing tests.",
      "Perform a risk-first review of this {{language}} diff: {{diff}}. Requirements: {{requirements}}. Context: {{context}}. Report only actionable findings with severity, evidence, and a fix direction.",
      "Act as a meticulous staff engineer reviewing {{language}}. Validate {{diff}} against {{requirements}} and {{context}}. Prioritize correctness, data loss, auth boundaries, concurrency, and regressions. Cite the exact changed behavior and propose focused tests.",
    ],
  },
  {
    name: "Travel Itinerary Builder",
    description: "Builds a paced itinerary around real preferences and constraints.",
    tags: ["travel", "planning", "consumer"],
    variables: ["destination", "dates", "interests", "pace", "constraints"],
    contents: [
      "Plan a trip to {{destination}} for {{dates}}. Interests: {{interests}}. Pace: {{pace}}. Constraints: {{constraints}}.",
      "Create a realistic day-by-day itinerary for {{destination}} during {{dates}}. Optimize for {{interests}} and a {{pace}} pace while respecting {{constraints}}. Minimize unnecessary transit.",
      "Design a thoughtful {{destination}} itinerary for {{dates}}. Preferences: {{interests}}; pace: {{pace}}; constraints: {{constraints}}. Include one anchor activity per day, flexible alternatives, neighborhood grouping, meal timing, and what to reserve.",
    ],
  },
  {
    name: "App Store Review Reply",
    description: "Writes respectful, useful replies to positive and critical app reviews.",
    tags: ["mobile", "support", "app-store"],
    variables: ["review", "rating", "product", "known_context"],
    contents: [
      "Reply to this {{rating}}-star review for {{product}}: {{review}}. Known context: {{known_context}}.",
      "Write a brief developer response to the {{rating}}-star {{product}} review: {{review}}. Use {{known_context}} where relevant. Thank the person, address the substance, and avoid defensiveness.",
      "Draft a human App Store response for {{product}}. Rating: {{rating}}. Review: {{review}}. Context: {{known_context}}. If there is a problem, acknowledge it and give a useful next step; if praise, respond specifically. Never ask for personal data publicly.",
    ],
  },
  {
    name: "Learning Coach",
    description: "Creates a practical lesson that adapts to level and available time.",
    tags: ["education", "coaching", "learning"],
    variables: ["topic", "level", "goal", "time", "learning_style"],
    contents: [
      "Teach {{topic}} to a {{level}} learner whose goal is {{goal}}. They have {{time}} and prefer {{learning_style}}.",
      "Create a focused lesson on {{topic}} for a {{level}} learner. Goal: {{goal}}. Time: {{time}}. Style: {{learning_style}}. Use one explanation, one worked example, and one practice task.",
      "Act as an adaptive coach for {{topic}}. Learner level: {{level}}; goal: {{goal}}; available time: {{time}}; preferred style: {{learning_style}}. Start with a diagnostic question, then provide a compact mental model, guided practice, feedback criteria, and a next session.",
    ],
  },
  {
    name: "Product Requirements Draft",
    description: "Turns a product idea into a decision-oriented, testable requirements document.",
    tags: ["product", "requirements", "planning"],
    variables: ["problem", "users", "evidence", "constraints", "success_metric"],
    contents: [
      "Draft product requirements for {{problem}} affecting {{users}}. Evidence: {{evidence}}. Constraints: {{constraints}}. Success: {{success_metric}}.",
      "Write a concise PRD for {{problem}}. Users: {{users}}. Evidence: {{evidence}}. Constraints: {{constraints}}. Define scope, non-goals, user stories, risks, and measurement using {{success_metric}}.",
      "Create a decision-ready product brief for {{problem}} and {{users}}. Ground it in {{evidence}} and {{constraints}}. Include desired outcome, hypotheses, critical journey, requirements with acceptance criteria, non-goals, rollout, failure modes, and {{success_metric}}.",
    ],
  },
  {
    name: "Structured Data Extractor",
    description: "Extracts reliable JSON while preserving uncertainty and source evidence.",
    tags: ["automation", "json", "extraction"],
    variables: ["document", "schema", "rules", "language"],
    contents: [
      "Extract data from {{document}} into {{schema}}. Rules: {{rules}}. Source language: {{language}}.",
      "Return valid JSON matching {{schema}} from {{document}}. Apply {{rules}}. The document language is {{language}}. Use null for missing values and do not infer identifiers.",
      "Perform auditable extraction from this {{language}} document: {{document}}. Output must match {{schema}} and {{rules}}. For ambiguous fields use null and add an _evidence object containing short source fragments and confidence scores.",
    ],
  },
] as const;

async function main() {
  console.log("Seeding Promptly demo workspace...");

  const password = await hash(TEST_PASSWORD, 10);
  const user = await prisma.user.upsert({
    where: { email: TEST_EMAIL },
    update: {
      name: "Promptly Test Team",
      password,
      image: null,
    },
    create: {
      name: "Promptly Test Team",
      email: TEST_EMAIL,
      password,
    },
  });

  await prisma.$transaction([
    prisma.apiKey.deleteMany({ where: { userId: user.id } }),
    prisma.aBTest.deleteMany({ where: { createdBy: user.id } }),
    prisma.promptVersion.deleteMany({ where: { createdBy: user.id } }),
    prisma.prompt.deleteMany({ where: { createdBy: user.id } }),
  ]);

  const createdPrompts: Array<{
    id: string;
    name: string;
    versionIds: string[];
  }> = [];

  for (const [promptIndex, fixture] of promptFixtures.entries()) {
    const promptNumber = String(promptIndex + 1).padStart(2, "0");
    const promptId = `demo-prompt-${promptNumber}`;
    const versionIds = fixture.contents.map(
      (_, versionIndex) => `${promptId}-v${versionIndex + 1}`,
    );
    const ageInDays = (promptFixtures.length - promptIndex) * 3;
    const createdAt = new Date(Date.now() - ageInDays * 24 * 60 * 60 * 1000);
    const triggerCount = 140 + promptIndex * 173;

    await prisma.prompt.create({
      data: {
        id: promptId,
        name: fixture.name,
        description: fixture.description,
        content: fixture.contents[2],
        variables: [...fixture.variables],
        tags: [...fixture.tags],
        createdBy: user.id,
        createdAt,
        updatedAt: new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000),
        isActive: promptIndex !== 13,
        triggerCount,
        currentVersionId: versionIds[2],
        versions: {
          create: fixture.contents.map((content, versionIndex) => ({
            id: versionIds[versionIndex],
            name: ["Baseline", "Clear structure", "Production candidate"][versionIndex],
            content,
            variables: [...fixture.variables],
            createdBy: user.id,
            createdAt: new Date(
              createdAt.getTime() + versionIndex * 24 * 60 * 60 * 1000,
            ),
            isActive: versionIndex === 2,
            triggerCount: Math.floor(
              triggerCount * [0.19, 0.31, 0.5][versionIndex],
            ),
            performance: {
              successRate: Number((0.71 + promptIndex * 0.008 + versionIndex * 0.045).toFixed(3)),
              averageLatencyMs: 920 - versionIndex * 85 + promptIndex * 11,
              averageRating: Number((3.7 + versionIndex * 0.38 + promptIndex * 0.015).toFixed(2)),
              sampleSize: 48 + promptIndex * 29 + versionIndex * 37,
            },
          })),
        },
      },
    });

    createdPrompts.push({ id: promptId, name: fixture.name, versionIds });
  }

  const testDefinitions = [
    { prompt: 0, name: "Warmth vs. resolution clarity", active: true, daysAgo: 8 },
    { prompt: 1, name: "Executive summary structure", active: true, daysAgo: 13 },
    { prompt: 2, name: "Value-first release notes", active: false, daysAgo: 34 },
    { prompt: 3, name: "Evidence framing experiment", active: true, daysAgo: 5 },
    { prompt: 5, name: "Incident update readability", active: false, daysAgo: 49 },
    { prompt: 6, name: "Short vs. contextual follow-up", active: true, daysAgo: 2 },
    { prompt: 9, name: "Risk-first review ordering", active: true, daysAgo: 18 },
    { prompt: 11, name: "Review reply specificity", active: false, daysAgo: 62 },
  ];

  for (const [testIndex, definition] of testDefinitions.entries()) {
    const prompt = createdPrompts[definition.prompt];
    const startDate = new Date(
      Date.now() - definition.daysAgo * 24 * 60 * 60 * 1000,
    );
    const sampleA = 180 + testIndex * 47;
    const sampleB = 205 + testIndex * 53;
    const conversionA = Number((0.18 + testIndex * 0.011).toFixed(3));
    const conversionB = Number((conversionA + 0.027 + (testIndex % 3) * 0.009).toFixed(3));

    await prisma.aBTest.create({
      data: {
        id: `demo-test-${String(testIndex + 1).padStart(2, "0")}`,
        name: definition.name,
        description: `Compare the baseline and production candidate for ${prompt.name}.`,
        promptId: prompt.id,
        startDate,
        endDate: definition.active
          ? null
          : new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000),
        isActive: definition.active,
        metrics: ["success_rate", "user_rating", "latency_ms"],
        results: {
          status: definition.active ? "collecting" : "completed",
          totalSamples: sampleA + sampleB,
          variants: {
            baseline: {
              samples: sampleA,
              successRate: conversionA,
              averageRating: Number((3.78 + testIndex * 0.04).toFixed(2)),
            },
            productionCandidate: {
              samples: sampleB,
              successRate: conversionB,
              averageRating: Number((4.14 + testIndex * 0.035).toFixed(2)),
            },
          },
          lift: Number((((conversionB - conversionA) / conversionA) * 100).toFixed(1)),
          confidence: Number((0.86 + testIndex * 0.014).toFixed(3)),
        },
        createdBy: user.id,
        versions: {
          create: [
            { versionId: prompt.versionIds[0], weight: 0.5 },
            { versionId: prompt.versionIds[2], weight: 0.5 },
          ],
        },
      },
    });
  }

  await prisma.apiKey.createMany({
    data: [
      {
        id: "demo-key-development",
        name: "Local development",
        key: "pk_demo_8d7f4c2a91e6b3057ac849d21f6e43b209ca578d304f6a12",
        userId: user.id,
        lastUsedAt: new Date(Date.now() - 35 * 60 * 1000),
      },
      {
        id: "demo-key-staging",
        name: "Staging integration",
        key: "pk_demo_12ac4098ef753b61d0479ca82f163e4a570bd2968ec413df",
        userId: user.id,
        lastUsedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  const [promptCount, versionCount, testCount, apiKeyCount] = await Promise.all([
    prisma.prompt.count({ where: { createdBy: user.id } }),
    prisma.promptVersion.count({ where: { createdBy: user.id } }),
    prisma.aBTest.count({ where: { createdBy: user.id } }),
    prisma.apiKey.count({ where: { userId: user.id } }),
  ]);

  console.log(
    `Seed complete: ${promptCount} prompts, ${versionCount} versions, ${testCount} A/B tests, ${apiKeyCount} API keys.`,
  );
  console.log(`Login: ${TEST_EMAIL} / ${TEST_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
