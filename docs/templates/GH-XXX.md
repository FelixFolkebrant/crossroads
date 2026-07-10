Feel free to use emojis, this document is meant to not be cognitivly heavy but still communicate concepts clearly but concise. Explainations of each category is in this template only. The real documents should be written with just content. 

# What 

What has been implemented. Few words as possible. Use a bulleted list or a numbered if it makes sense. 

### Plan diff 
If the implementation differs from GH-X-plan.md (often acceptance criteria, tasks or scope) then write it out here. Brief with bullet points or preffered format that makes sense. 

### Confirmation
Exact instructions on how to confirm that this issue does what it says it does and works. We assume that testing has passed so only include manual testing here such as "Open website/new and see the new add country button" or "send the following curl request, Expected outcome:"


# Heatmap
The heatmap tells which parts of the code has made the most opinionated changes. These should be really brief and readable. Extended explainations should be inside GH-X-deepdive.md. 

> **Cold**: Code that basically needs no review. Really obvious what is done and cannot be done any other way. Routine code or standard best practices.

> **Warm**: Ordinary business logic following known patterns. If it is a known pattern but with a chance to be done in a different way and its not outside of best practice it can be worth a quick look -> warm. 

> **Hot:** Where the code has made a statement. Where a decision has been made or has the potential for review or refactor.  

> **Stylistic:** Where a change is not about architecture and not about a big change but is a smaller stylistic choice. This can be things such as list comprehension vs for loop or deciding to split up a component or not in react. Or maybe a naming convention. 

%% Style choices should be saved to a STYLE.md %%

The goal is that more and more choices should become Cold or at least Warm choices. The more patterns we can decide earlier, the more cold the heatmap should become over time in theory. 

## Hot

### H1 - What decision was made
* What decisions was made?
* Where (file/files lines)
* Why was it made? Best practices / industry standard? Similar pattern built this way previously in code base?
* What where the alternatives? 

## Warm
* What decision was made
* Where

## Cold
Summarized in a table 

| Where          | What                                                      |
| -------------- | --------------------------------------------------------- |
| whichFile:line | Standard react icon following pattern of other icons      |
| whichFile      | File deleted, no longer needed because of {this new file} |

## Styistic

### S1 - What stylistic choice was made

* What
* Alternative
* When to apply
