
Template: GL-XXX-REVIEW.md \
Relevant files: GL-XXX-PLAN.md, GL-XXX.md, SPEC.md \

prompt:
```
Act as a really strict senior dev and review the changes made by this branch. Write your detailed and structured feedback in GL-XXX-REVIEW.md (where xxx is the current issue) where you rank all misses and points to improve in order of severity. You can use the plan for inspiration at what to look for, however the review should be scoped at the feature as a whole, not explicitly the requirements written down in the GL-XXX-PLAN.md or finished implemnentation detials in GL-XXX.md. Specify how to solve each problem in detail.
```

# Explainations (are not included in the final file)

### Heatmap:
The heatmap tells which parts of the code has made the most opinionated changes. These should be really brief and readable. Heatmaps are not how big a problem is, but instead how opinionated the change is. If the change is really obvious and aligns with previous patterns and/or SPEC.md and it is something that can onoly be fixed in one way, it is cold (even if it is a really big problem). If it is a problem that has different sollutions: example: No auth for REST requests. This problem can be deffered to a later issue, solved in this issue, or third party auth etc. This would be a hot issue. 

> **Cold**: Code that basically needs no review. Really obvious what needs to be done and cannot be done any other way. Routine code or standard best practices.

> **Warm**: Ordinary business logic following known patterns. If it is a known pattern but with a chance to be done in a different way and its not outside of best practice it can be worth a quick look -> warm. 

> **Hot:** Where the code has made a statement. Where a decision needs to be made and implementation is not obvious or has options. 

The goal is that more and more choices should become Cold or at least Warm choices. The more patterns we can decide earlier, the more cold the heatmap should become over time in theory. 


### Severity score

| **Level** | **Severity**           | **Meaning**                                                  | **Action Required**                               |
| --------- | ---------------------- | ------------------------------------------------------------ | ------------------------------------------------- |
| **5**     | **Critical / Blocker** | Broken build, severe bug, or security risk.                  | **Must fix** before merge.                        |
| **4**     | **Major**              | Logical flaw, architectural violation, or performance trap.  | **Must fix** before merge.                        |
| **3**     | **Moderate**           | Edge-case risk, missing tests, or hard to maintain.          | **Should fix**, unless there is a tight deadline. |
| **2**     | **Minor**              | Suboptimal approach, code duplication, or readability issue. | **Optional fix** (good to do if time permits).    |
| **1**     | **Nitpick**            | Purely stylistic, naming conventions, or formatting.         | **Optional / Informational** only.                |

Also add a severity score 1-5 to give a nodd to how important it is to solve it.

---

# Problems:
Example:
## 1. Problem description 
### 1/5 - Hot 
**Problem**
* What is the problem?
* Why is this a problem? Examples using code or explain in words concise.  

**Sollution**

* What is the sollution? Examples using code or explain in words concise.
* What are the alternatives for solving it?  

### Sollution instruction:
Detailed instructions on how to solve the issue that a junior dev would be able to follow.
