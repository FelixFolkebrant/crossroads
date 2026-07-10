Feel free to use emojis, this document is meant to not be cognitivly heavy but still communicate concepts clearly but concise. Explainations of each category is in this template only. The real documents should be written with just content. 

# What 
For all sections in this chapter: Use as few words as possible. Use a bulleted list or a numbered if it makes sense.
What will be implemented. 

### What not


### What will be deffered to later issues


### Acceptance criteria

- [ ]   

### Tasks

#### 0 - Template
Here we describe in detail what each commit is going to be responsible for according to atomic commits. 

<br />
<br />
<br /> 

---

<br />
<br />
<br /> 
  
# Heatmap
Explaination of heatmap (mostly for later use when summing up changes in review) The heatmap tells which parts of the code has made the most opinionated changes. These should be really brief and readable. Extended explainations should be inside GH-X-deepdive.md. 

> **Cold**: Code that basically needs no review. Really obvious what is done and cannot be done any other way. Routine code or standard best practices.

> **Warm**: Ordinary business logic following known patterns. If it is a known pattern but with a chance to be done in a different way and its not outside of best practice it can be worth a quick look -> warm. 

> **Hot:** Where the code has made a statement. Where a decision has been made or has the potential for review or refactor.  

> **Stylistic:** Where a change is not about architecture and not about a big change but is a smaller stylistic choice. This can be things such as list comprehension vs for loop or deciding to split up a component or not in react. Or maybe a naming convention. 

%% Style choices should be saved to a STYLE.md %%

The goal is that more and more choices should become Cold or at least Warm choices. The more patterns we can decide earlier, the more cold the heatmap should become over time in theory. 

In the plan we only want to bring fourth the hot and possibly major stylistic choices if it feels needed. Do not include the stylistic section if we do not predict any stylistic choices. 

## Hot
### 1 
* What decisions?
* Why is it proposed? Best practices / industry standard? Similar pattern built this way previously in code base?
* What where the alternatives? 

```
Code example if helpful. Alternatives can also be code examples if it explains better.
```

## Stlistic
### S1
Same format as hot mostly
