
This manfiesto is created to define ideas that are used to optimize AI usage. We want to strike a balance between having a high velocity while still keeping a human in the loop. This is often not the case. 

# 1. Problem defenition

## 1.1 - AI velocity
People either go fully on vibes and trust AI to make all decisions and the human just presses "next". The other alternative is readig every line that the AI has written in detail, questioning everything. This approach gives basically no boost in velocity compared to just writing everything yourself.

## 1.2 - Overplanning
A problem and a roadblock when having an idea is trying to plan out too far ahead of time. Planning every single feature, the full stack and scalability kills creativity. The task is also impossible, some dots you can only connect afterwards. But you also do not want to give a general description and have AI make guesses on all decisions that you then have to correct. The process should be quick and stupidly simple to start and then decisions should be delayed and made gradually in coordination with the growth of the app and the user. 

## 1.3 - Losing direction
A lack of planning does not only result in AI taking too many (tasteless) choices on it's own but also results in a loss of direction. Under development, the question "what are we doing next" should always be answered and planned. 

## 1.4 - Human attention span
Human attentionspan is something that we value a lot. If something isn't explained in a clear way or has too much detail and fluff or poor visual presentation it will be skimmed. Skimming is not nessicarily bad and should be encouraged and helped when it fits. The visual hierarchy should allow the user to get an overview of what is going on and then dive deeper in the things that are important, the things that need taste. 

# 2. Sollution - Gradual defenition
## 2.1 - It should be stupidly simple to get started (`IDEA.md`)
`IDEA.md` is the entrypoint of all projects. The user describes the idea in as simple terms as possible. Depending on how familiar the user is with the domain, the description might inclue things such as preferences (that should be taken as suggestions) for modules or tech stack. The user also describes one or more user flows that represent the app. Combining the user flow with the description should be enough to get a good idea of what the app is about in as little writing as possible. 

## 2.2 - Taste
When the user has specified `IDEA.md` we start exploring by building. The human in the loop should act as the source of taste. The gradual definition is therefore a process of transfering the taste of the human to the AI through defining patterns and learning by decisions made.   
Taste can not always be brought out through planning. It is easier to see something and say if it is good or bad and how to change it than having to describe the perfect outcome before. However this doesn't mean that we have to build something, but instead that statements with motivations and alternatives are preferred over open questions.   
As taste is defined, we need lower human involvement, which results in higher velocity. The more costly a decision is to reverse (now but more importantly, in the future when we extend the app), the more human taste should be required. We therefore want to start with the most costly decisions and make out the backbone of the application. We want to define "narrow slices" of the application. 
This usually means deining modules and plumbing. 

## 2.3 - Scaffolding (modules and plumbing)
We make decisions top down. We do not need to make every decision now. But we do not want to make any decision later down the line that will result in heavy rewrites. Example of decisions:

>**Good:** We will use React + tailwind. Auth will be third party and handled by ...

Reason: Building using NextJS and then later realizing it is overkill will be a lot of refactors. Same thing goes for tailwind -> a lot of rewrites. If auth is something that will take time refactoring and cannot be built as an addon later it is important to do now. 

> **Bad:** We will use react-graphs for the graph part of the small feature that will be implemented in a month. 

Plumbing is connecting the modules between eachother to create a narrow slice. The goal is not to define schemas, but to define how the schemas are defined. Defining schemas of all types needed later here is widening the slice. Defining the schema for one hello world type example and then trying to send that from backend to frontend is a proper narrow slice. 

Instead of building wide like building a full backend and testing it through API, then starting with frontend, we would build a backend with one endpoint and a frontend that just displays information from this one endpoint. When we have this in place we can start fleshing out these narrow slices through building out the core functionality of the application, again **prioritizing the hard-to-reverse decisions** while widening so that we can **establish patterns** to reuse. This is the whole goal of granular defenition.

## 2.4 - Heatmap
The heatmap tells which parts of the code has made the most opinionated changes. These should be really brief and readable. 

> **Cold**: Code that basically needs no review. Really obvious what is done and cannot be done any other way. Routine code or standard best practices.

> **Warm**: Ordinary business logic following known patterns. If it is a known pattern but with a chance to be done in a different way and its not outside of best practice it can be worth a quick look -> warm. 

> **Hot:** Where the code has made a statement. Where a decision has been made or has the potential for review or refactor.  

> **Stylistic:** Where a change is not about architecture and not about a big change but is a smaller stylistic choice. This can be things such as list comprehension vs for loop or deciding to split up a component or not in react. Or maybe a naming convention. 

Style choices should be saved to a STYLE.md
Coding patterns worth saving are stored in PATTERNS.md

The goal is that more and more choices should become Cold or at least Warm choices. The more patterns we can decide earlier, the more cold the heatmap should become over time in theory. 

## 2.5 - Roadmaps
The problem of planning ahead should also be solved thorugh gradual defenition. A plan should gain more detail the closer we come to it. The plan should also be very simple to follow. Here we can also keep track of deffered decisions and backlog so that we have somewhere to deffer them to in the timeline.   

The heatmap should be used in planning stage as well. However here it is on a higher conceptual level. What might be a hot decision in an issue is not something that we care about. Here we want to focus on higher conceptual problems. However we still scale these problems with the same terminology. However we add a new level:

> **Crossroad** - Big decisions that needs human input because of application scale or goal oriented decision. Examples: Choice of stack, third party integrations.

Example of hot decision on issue level:
* Add third party graph component for the graph?
* Seperate builder and listing UI?

Example of crossroad decsions on planpoint level:
* Relational DB vs no-SQL DB.
* Third party vs self hosted vs in memory db
* React vs NextJS

This is all based on the theory of gradual defenition and walking skeleton. We do not want to make granular decisions (such as the issue level hot decisions above) that can be deffered to doing later in an issue or at a later stage of development. We want to build each vertical slice before widening. We generally want to defer making decisions as much as possible to prevent overplanning and preventing cognitive load. Some dots you can only connect in hindsight. 

---

# Workflow
```
Plan work
1. Create IDEA.md 
2. Create ROADMAP.md -> Accept roadmap
3. Create PLANPOINT-1.md -> Accept planpoint 1
   
Issue work
1. Create GH-1-PLAN.md + checkout branch
2. Make changes, atomic commits
   
Review process
3. Review into GH-1-REVIEW.md -> Accept GH-1-REVIEW.md
4. Fan out agents to fix. Commit as "Fixup: " -> Review fixup commits
5. Update GH-1.md and check off GH-1-REVIEW.md -> Rebase 

6. Repeat review process until done -> Merge

```

Finishing
1. Push, create MR
2. (optional) - CI + manual review.
3. Approved -> Remove all WIP documents and move GH-1.md to .crossroads/issues

### 1. - IDEA.md
An IDEA.md is defined. Stack preferences are written and user flows are defined. Updates to this can be done at later points for new features or specifications etc. 

### 2. - ROADMAP.md
A general roadmap is created with the goal of cooling down the heatmap. Statements are made about the architecture and marked as hot decisions/crossroads. All statements are motivated and have alternatives.  
Above issues are planpoints. A planpoint is a group of issues that result in gradual defenition. The roadmap is for direction and planpoints are for decisions. The goal of the roadmap is to map out what the planpoints goals should be and give them context to how it fits into the project as a whole. Since the planpoints are defined loosly the further away they are, we can easily see if the direction is wrong. 
### 3. - PP-X.md
A planpoint exists to give context and direction to issues. A planpoint should include the issues we want to do in gradual detail. We should also take decisions here. Everything we need to decide before we get started with the issues. The crossroads and hot decisions. 

### 4. GH-X-PLAN.md
Here we plan out the issue. We use the heatmap to explicitly tell which decisions will be made. We do not ask questions, we make statements to be decided based on taste.  
> *"Taste can not always be brought out through planning. It is easier to see something and say if it is good or bad and how to change it than having to describe the perfect outcome before. However this doesn't mean that we have to build something, but instead that statements with motivations and alternatives are preferred over open questions. ""*
### 5. GH-X-REVIEW.md
When an issue is done we want to be able to review the decisions that have been done through the review process. We therefore document all issues inside GH-X-REVIEW.md and mark things as solved, deffered or ignored. Issues are brought up in the heatmap format as well as a severity rating. 

### 6. GH-X.md
This is the only artifact that will persist after finishing the issue is complete and merged in. This means that it will have to contain what has been implemented, what has not as well as the big decisions made throughout planning and review. 
