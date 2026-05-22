// E-CIRA assessment configuration.
// Source: EIH_Innovation_Readiness_Assessment_ECIRA.xlsx (Assessment + Maturity Framework + Results tabs).

export type DiagnosticAnswer = 'yes' | 'partially' | 'no';

export interface Level {
	level: 1 | 2 | 3 | 4 | 5;
	label: string;
	description: string;
	evidence: string;
}

export interface Dimension {
	key: string;
	number: number;
	title: string;
	summary: string;
	levels: Level[];
	diagnostics: string[];
}

export interface Zone {
	min: number;
	max: number;
	code: 'red' | 'yellow' | 'green';
	label: string;
	pathway: string;
}

export const LEVEL_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
	1: 'Lagging',
	2: 'Emerging',
	3: 'Developing',
	4: 'Advancing',
	5: 'Leading'
};

export const DIMENSIONS: Dimension[] = [
	{
		key: 'governance',
		number: 1,
		title: 'Governance & Innovation Strategy',
		summary:
			"The extent to which innovation is embedded in your organisation's governance, strategy, and risk management — not just mentioned in speeches.",
		levels: [
			{
				level: 1,
				label: LEVEL_LABELS[1],
				description:
					"Focused purely on compliance and operations. Innovation is viewed as a compliance risk or 'waste'. No budget for experimentation.",
				evidence:
					"Strategic Plan has zero mentions of 'innovation' or 'R&D'. No budget line item for experimentation."
			},
			{
				level: 2,
				label: LEVEL_LABELS[2],
				description:
					"'Innovation' appears in vision statements, but no governance structure supports it. Risk tolerance is zero.",
				evidence:
					"Annual Report mentions innovation as a 'value'. No Board Minutes discussing innovation risk or failures."
			},
			{
				level: 3,
				label: LEVEL_LABELS[3],
				description:
					'A specific innovation strategy exists with allocated budget, but approval requires heavy bureaucracy (CEO sign-off for small items).',
				evidence:
					'Signed Innovation Strategy document aligned with national development plans. Dedicated R&D budget code (OPEX).'
			},
			{
				level: 4,
				label: LEVEL_LABELS[4],
				description:
					'Governance allows calculated risk. Executives have KPIs tied to innovation, not just financial efficiency.',
				evidence:
					'Executive Scorecard showing innovation KPIs (e.g., % revenue from new services). Investment Committee charter.'
			},
			{
				level: 5,
				label: LEVEL_LABELS[5],
				description:
					"The Board actively manages an innovation portfolio. A 'Risk Appetite Statement' protects managers from audit findings on failed pilots.",
				evidence:
					"Risk Appetite Statement signed by the Board (explicitly allowing x% failure rate). Minutes showing a 'Kill Decision' on a project."
			}
		],
		diagnostics: [
			'Innovation is explicitly referenced in our current strategic plan with defined goals and timelines',
			'Senior leadership actively champions innovation and communicates the direction regularly',
			'We have a dedicated budget line for innovation/experimentation separate from operational budgets',
			'Innovation risk is formally discussed at Board or Executive Committee level at least quarterly',
			"There is a named individual or team accountable for innovation outcomes (not just 'everyone')"
		]
	},
	{
		key: 'procurement',
		number: 2,
		title: 'Procurement & Organisational Agility',
		summary:
			'How fast your organisation can contract, purchase from, and engage with external innovators — startups, fintechs, and technology partners.',
		levels: [
			{
				level: 1,
				label: LEVEL_LABELS[1],
				description:
					'100% adherence to standard public tender (Proclamation 649/2009). Lowest bidder wins. Cycle time > 9 months.',
				evidence:
					'Procurement Manual showing no exceptions for innovation/pilots. Last tender timeline > 200 days.'
			},
			{
				level: 2,
				label: LEVEL_LABELS[2],
				description:
					'Awareness of the need for speed. Ad-hoc waivers used occasionally but require political capital. Cycle 6–9 months.',
				evidence:
					"Evidence of 'Single Source' waivers used sporadically. Legal redlines on standard startup NDAs."
			},
			{
				level: 3,
				label: LEVEL_LABELS[3],
				description:
					"A specific 'Pilot Contract' template exists. Legal understands 'Proof of Concept'. Cycle 3–6 months.",
				evidence:
					'Standardised Pilot Agreement (short form, <10 pages). Signed contract example < 120 days.'
			},
			{
				level: 4,
				label: LEVEL_LABELS[4],
				description:
					"Systematically uses 'Innovation Exception' clauses. Startups have a separate registration track. Cycle 1–3 months.",
				evidence: 'Fast-Track Process Map approved by Procurement Director. List of pre-qualified startup vendors.'
			},
			{
				level: 5,
				label: LEVEL_LABELS[5],
				description:
					"Dedicated 'Venture Client' unit buys startup solutions without full tender. Cycle < 4 weeks.",
				evidence:
					"Purchase Order issued to a startup within 30 days of first contact. 'Venture Client' unit charter."
			}
		],
		diagnostics: [
			'Our procurement process can accommodate pilot/PoC contracts with startups or SMEs under simplified rules',
			'We have a fast-track or exception pathway for innovation-related purchasing (separate from standard tender)',
			'Legal and procurement teams have experience drafting contracts with technology startups or innovators',
			'We can issue a purchase order to a new vendor in under 90 days when needed',
			'Decision-making authority for pilot-scale spending (< $50K) is delegated below CEO level'
		]
	},
	{
		key: 'digital',
		number: 3,
		title: 'Digital Infrastructure & Data Readiness',
		summary:
			"The maturity of your technology infrastructure, data systems, and digital capabilities — the 'plumbing' that innovation partners need to integrate with.",
		levels: [
			{
				level: 1,
				label: LEVEL_LABELS[1],
				description:
					'Core processes are paper-based or physical. Data is locked in filing cabinets or local desktops. No mechanism exists for an external partner to access data, systems, or facilities for a pilot. A startup would have nowhere to plug in.',
				evidence:
					'Physical archives. Lack of core ERP system. No network diagram or asset register. No data-sharing agreement template. For industrial SOEs: no digital monitoring of physical infrastructure.'
			},
			{
				level: 2,
				label: LEVEL_LABELS[2],
				description:
					"Functional databases exist (HR, Finance) but don't talk to each other. Manual data export required for reporting. A startup could theoretically pilot, but it would require months of custom integration. For hard-tech SOEs: equipment and facilities exist but are managed manually with no digital monitoring.",
				evidence:
					'Excel-based management reporting. Systems integration requires manual batch files. No sandbox or test environment for external partners. For industrial SOEs: no SCADA, IoT, or OT monitoring on key assets.'
			},
			{
				level: 3,
				label: LEVEL_LABELS[3],
				description:
					"Data Warehouse or Enterprise Service Bus (ESB) connects core systems. 'Single Source of Truth' begins to emerge. A startup could pilot within 4–8 weeks with internal IT support. For hard-tech SOEs: some operational technology (OT) is digitised and monitored.",
				evidence:
					'IT Architecture Diagram showing Integration Layer (ESB/API Gateway). BI Dashboard screenshots. A test/staging environment exists (even if basic). For industrial SOEs: SCADA or IoT deployed on key assets. At least one data set could be shared under NDA.'
			},
			{
				level: 4,
				label: LEVEL_LABELS[4],
				description:
					'Real-time data availability. Predictive analytics (AI/ML) used for decision making. Microservices architecture. Sandbox or test environment available for external partners — a startup could begin a pilot within 2–4 weeks. For hard-tech SOEs: connected OT with digital twins or remote monitoring.',
				evidence:
					'AI/ML Use Case in production. Documented Internal APIs. Sandbox/staging environment documented and available. Cybersecurity framework covers partner access. For industrial SOEs: IoT/sensor data accessible, digital twin or simulation capability.'
			},
			{
				level: 5,
				label: LEVEL_LABELS[5],
				description:
					'Platform business model. External partners can integrate via Open APIs (e.g., Telebirr SuperApp). Data is monetised. Startups can self-onboard to a pilot environment. For hard-tech SOEs: full OT-IT convergence with partner-accessible data streams. The SOE operates as an innovation platform.',
				evidence:
					'Public Developer Portal URL. Revenue from API/Data monetisation. Pre-configured pilot environments with documentation. For industrial SOEs: partner access to live operational data under governance. Multiple active technology integrations with external partners.'
			}
		],
		diagnostics: [
			'Our core digital systems (ERP, CRM, etc.) are integrated and can share data with an external partner within weeks, not months',
			'We have (or could quickly set up) a test/sandbox/staging environment where a startup could pilot without risking live operations',
			'We have APIs or integration capabilities that external technology partners could connect to [SOFTWARE/DIGITAL SOEs]',
			'Our physical infrastructure and operational technology (equipment, plants, utilities, grid) has some level of digital monitoring (IoT, SCADA, sensors) that could generate data for a pilot [HARD-TECH/INDUSTRIAL SOEs]',
			'We have a cybersecurity and data governance framework that allows controlled data sharing with vetted external partners'
		]
	},
	{
		key: 'portfolio',
		number: 4,
		title: 'Portfolio Management & Resource Allocation',
		summary:
			"How your organisation allocates resources across 'keeping the lights on' vs. new growth — and whether you actively manage an innovation portfolio.",
		levels: [
			{
				level: 1,
				label: LEVEL_LABELS[1],
				description:
					"100% of focus/budget is on 'Keeping the Lights On'. No innovation projects.",
				evidence: 'Project list containing only maintenance/repair items.'
			},
			{
				level: 2,
				label: LEVEL_LABELS[2],
				description:
					'Focus on efficiency improvements (Horizon 1). Doing the same things, but slightly better/cheaper.',
				evidence: "Project list showing digitisation of existing processes (e.g., 'e-Office')."
			},
			{
				level: 3,
				label: LEVEL_LABELS[3],
				description:
					"Balanced portfolio. Some bets on 'Adjacent' markets (Horizon 2) — new products for existing customers.",
				evidence: 'Portfolio report showing Horizon 2 projects (e.g., Telco launching streaming service).'
			},
			{
				level: 4,
				label: LEVEL_LABELS[4],
				description:
					"Active investments in 'Transformational' (Horizon 3) ideas. Protecting against disruption. 70/20/10 split.",
				evidence:
					"Innovation Dashboard visualising risk vs. return across horizons. Budget allocated to H3 'Moonshots'."
			},
			{
				level: 5,
				label: LEVEL_LABELS[5],
				description:
					"Dynamic portfolio management. 'Zombie projects' are killed mercilessly. Resources flow to winners.",
				evidence:
					'Kill List: Record of projects stopped to reallocate funds. VC-style investment memos for internal projects.'
			}
		],
		diagnostics: [
			'We allocate a defined percentage of our budget to new products, services, or business models (beyond BAU)',
			'We have a formal process for evaluating and prioritising innovation projects against each other',
			'We have stopped or killed at least one underperforming project in the past 12 months to free resources',
			'We track innovation ROI or impact metrics (e.g., % revenue from products launched in past 3 years)',
			'Resource allocation decisions for innovation are made by a dedicated committee (not just the CFO)'
		]
	},
	{
		key: 'ecosystem',
		number: 5,
		title: 'Ecosystem Linkage & Partnership Capability',
		summary:
			"Your organisation's ability and willingness to collaborate with external partners — startups, universities, technology companies, and other SOEs.",
		levels: [
			{
				level: 1,
				label: LEVEL_LABELS[1],
				description:
					"'Not Invented Here' syndrome. The SOE tries to build everything internally. No external trust.",
				evidence: 'No external MOUs or partnerships recorded.'
			},
			{
				level: 2,
				label: LEVEL_LABELS[2],
				description:
					"'Innovation Theater'. Sponsors hackathons and visits hubs, but no contracts or commercial deals result.",
				evidence: 'Marketing photos of hackathons with zero follow-up contracts.'
			},
			{
				level: 3,
				label: LEVEL_LABELS[3],
				description:
					'Active MOUs with Ecosystem Players, Universities (AAU) or Incubators. Some knowledge sharing, but low commercial output.',
				evidence: 'Signed MOUs with clear deliverables (not just ceremonial). Joint research papers.'
			},
			{
				level: 4,
				label: LEVEL_LABELS[4],
				description:
					"Active 'Co-Creation'. Paying customer of local startups/SMEs. Integration of external tech into core product.",
				evidence: "Commercial Contracts with local tech startups. 'Powered by' branding on SOE products."
			},
			{
				level: 5,
				label: LEVEL_LABELS[5],
				description:
					"The SOE acts as a 'Keystone' player. It provides the platform/infrastructure that others build upon.",
				evidence: 'CVC Investment Term Sheets. Partner program with >50 active external companies.'
			}
		],
		diagnostics: [
			'We have previously contracted and paid a startup or SME for a technology product or service',
			'We have a formal process for sourcing, evaluating, and onboarding external innovation partners',
			'We have an existing relationship with at least one innovation hub, incubator, or accelerator',
			'We have clear IP and data-sharing policies for working with external technology partners',
			'We actively participate in cross-SOE or cross-sector knowledge sharing on innovation'
		]
	},
	{
		key: 'culture',
		number: 6,
		title: 'Innovation Culture & Talent',
		summary:
			'Whether your people are motivated, skilled, and empowered to innovate — and whether your HR systems reward innovation rather than punish risk-taking.',
		levels: [
			{
				level: 1,
				label: LEVEL_LABELS[1],
				description:
					"Strict hierarchy. Failure is punished. 'Job for life' mentality. No incentive to change. No one is responsible for innovation or external engagement — it is nobody's job.",
				evidence: 'HR policy showing zero innovation-related performance criteria.'
			},
			{
				level: 2,
				label: LEVEL_LABELS[2],
				description:
					"Employees are aware of innovation but see it as 'someone else's job'. No dedicated team or individual is assigned to innovation. Startup engagement happens only when a vendor approaches the SOE through formal procurement.",
				evidence: 'Suggestion box (usually empty). Innovation mentioned in town halls but not rewarded.'
			},
			{
				level: 3,
				label: LEVEL_LABELS[3],
				description:
					'Innovation Awards exist. Non-financial recognition for ideas. A single individual or part-time coordinator has been informally tasked with exploring innovation, but there is no dedicated team, budget, or mandate to engage startups.',
				evidence: 'Internal newsletter highlighting innovator stories. Innovation Award ceremony photos.'
			},
			{
				level: 4,
				label: LEVEL_LABELS[4],
				description:
					'Innovation KPIs in performance reviews. Career paths exist for innovators. Training provided. A small dedicated innovation team (or unit) exists with a clear mandate, and has begun engaging startups, accelerators, or innovation ecosystem players.',
				evidence:
					"HR Records showing 'Innovation' as a competency in annual reviews. Innovation training certification logs."
			},
			{
				level: 5,
				label: LEVEL_LABELS[5],
				description:
					'Shared success. Intrapreneurs get financial upside (bonus/phantom equity) if their venture succeeds. A fully staffed innovation unit operates with its own budget, KPIs, and authority to source, evaluate, and contract external innovators and startups independently.',
				evidence: 'Incentive Policy detailing profit-sharing or bonuses for successful new product launches.'
			}
		],
		diagnostics: [
			'Employees who propose or lead new ideas are formally recognised and rewarded (beyond verbal praise)',
			'Innovation is included as a competency or KPI in our performance review system',
			'Our organisation tolerates and learns from failure rather than punishing it',
			"We have identified and empowered 'innovation champions' — senior leaders who advocate for new ideas",
			'We provide training or development opportunities specifically focused on innovation skills'
		]
	}
];

export const MAX_SCORE = DIMENSIONS.length * 5; // 30

export const ZONES: Zone[] = [
	{
		min: 0,
		max: 10,
		code: 'red',
		label: 'Low Readiness',
		pathway:
			'Foundational fixes needed. The organisation is likely blocking innovation through rigid policy. Focus on Governance (Dim 1) and Culture (Dim 6) first. JSE will provide targeted pre-engagement support to address critical gaps before pilot matching begins.'
	},
	{
		min: 11,
		max: 20,
		code: 'yellow',
		label: 'Medium Readiness',
		pathway:
			'Developing. Pockets of innovation exist but are not systemic. You need to bridge the gap between Digital Infrastructure (Dim 3) and Procurement (Dim 2). JSE onboarding phase will focus on building the internal structures needed for successful startup partnerships.'
	},
	{
		min: 21,
		max: 30,
		code: 'green',
		label: 'Good Readiness',
		pathway:
			"Ready for Scale. The organisation has the 'plumbing' to support high-growth ventures. Focus on aggressive Portfolio Management (Dim 4) and Ecosystem Linkage (Dim 5). JSE will fast-track you to pilot matching and active innovation partnerships."
	}
];

export function zoneFor(score: number): Zone {
	return ZONES.find((z) => score >= z.min && score <= z.max) ?? ZONES[0];
}

export type ScoresByDim = Partial<Record<string, number>>;
export type DiagnosticsByDim = Partial<Record<string, DiagnosticAnswer[]>>;

export interface AssessmentPayload {
	scores: ScoresByDim;
	diagnostics: DiagnosticsByDim;
}

export function totalScore(scores: ScoresByDim): number {
	return DIMENSIONS.reduce((sum, d) => sum + (Number(scores[d.key]) || 0), 0);
}

export function averageScores(payloads: AssessmentPayload[]): {
	per: Record<string, number>;
	total: number;
} {
	const per: Record<string, number> = {};
	for (const d of DIMENSIONS) {
		const vals = payloads.map((p) => Number(p.scores[d.key]) || 0).filter((v) => v > 0);
		per[d.key] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
	}
	const total = Object.values(per).reduce((a, b) => a + b, 0);
	return { per, total };
}
