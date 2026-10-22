# Site conversation agent: prompt rework, 21 Oct 2026

Ten scripted conversations, written as a visitor like Bruce (Persona 4, the Besieged Owner) would have them, run three times through the live `/api/chat` route on a local dev server with the production model settings (`claude-sonnet-4-5`, 1024 max tokens, cached system block). Only the system prompt changed between runs.

| Run | Prompt | Lines | Words |
|---|---|---|---|
| Before | `src/lib/chat-prompt.ts` at `0807259`, the commit before the Smart Site rewrite | 481 | 3,624 |
| Current | `src/lib/chat-prompt.ts` on `main` (`c910e80` then `32bc55a`) | 586 | 4,708 |
| After | this branch | 327 | 2,893 |

The ten conversations: what is a Smart Site, what does it cost, will I lose my rankings, how is it different from a chatbot, can it book appointments, what happens after hours, a question about a specific blog post, a pricing push, an off-topic question, and "I want to talk to Adam". Each has two or three visitor turns. The assistant's own replies are fed back as history, exactly as the widget does. Full transcripts for all three runs are at the end of this file.

## What got worse between the old prompt and `main`

The rewrite on 20 Oct put the Smart Site framing on top of the old six-product prompt instead of replacing it. The model received two product catalogues (the Smart Site's four jobs, then the six parts in full, including the Living AI Website it is told never to name), two sets of reply examples that still talk about "AI marketing automation", and a call-to-action rule that widened the triggers and added a required two-door sentence. The prompt grew by a third. The replies show it.

1. **Length.** Average reply went from 70 to 89 words, against a stated target of 60. Fourteen of 22 replies went over 80 words (eight before). The longest was 141 words. The "what is a Smart Site" conversation averaged 130 words a reply.

2. **The parts catalogue leaks into Smart Site answers.** Asked what it would do for a training organisation, the current prompt answers with a numbered First, Second, Third that includes the Outreach Agent ("picks up on people already engaging with you... Not cold outreach"). Asked what is in the monthly cost, it lists "the full content ecosystem and outreach agent on top of it". It says "the site conversation agent" and "Marketing Ecosystem: the outbound side" to a visitor. Bruce was never going to say any of that back to his partner.

3. **Accuracy about the offer slipped in the opposite direction from before.** The old prompt invented monthly prices ($500, $5,000, $10,000 a month) and told the rankings question "No. Nothing breaks." The current prompt stops inventing dollar figures but still says "Thousands", invents "it's had real conversations with hundreds of people by now", and turns the redirect fact into a promise: "The structure changes, the rankings stay" and "Rankings often improve from there". The facts list in the prompt says not to promise that.

4. **Voice slipped into Adam's first person.** "Every appointment in my calendar since June 30", "I eliminated 36 hours per week of personal marketing work from my own business". The site is speaking as Adam. The old prompt's "use I for proof points" rule, kept verbatim, collides with the new "you are a Smart Site, live" identity.

5. **The two-door call to action is formulaic, then forgotten.** The sentence "Two ways to go from here: run your site through the analyzer and see where it is losing enquiries, or if you want it fixed, book a chat with Adam" appears word for word from the prompt's example. On the second cost question the marker fires again with only one door described (the Strategy Call), which the prompt forbids. On "I want to talk to Adam" the marker does not fire at all: the model pastes the booking URL inline and asks a qualifying question, so the visitor sees no buttons. The old prompt fired the marker there.

6. **A question on the end of nearly every reply.** Nineteen of 22 replies end with a question, including the two replies after "I want to talk to Adam" ("What's driving the timeline?"). The old prompt did this too (20 of 22). For an essay reader thinking out loud it was tolerable. For an owner asking a direct question it reads as a sales script, and it is the main reason replies run long.

7. **Slop patterns.** "The ad spend works, the site doesn't." "The question isn't the absolute number, it's what it replaces." "The structure changes, the rankings stay." "Not the same thing." as a one-line opener. "genuinely". "most people". A First, Second, Third list in prose. The old prompt had fewer of these because it had less to say.

8. **Off-topic handling recites the internal lane.** "I handle marketing automation: content, email, ads, lead generation, and AI agents for marketing functions." That is the prompt's own scope sentence read back to the visitor.

Page context did not get worse. On the blog post both prompts answered from the article and applied it to the eight-course training business well.

## What the rebuilt prompt changes

Written from `methodology.md` v5.0 and `smart-site-offer.md` v0.4, to Persona 4, checked against `writing-guidelines.md` and the anti-slop rules. It keeps the `[BOOK_QUICK_CHAT]` marker, the two-door sentence, the Smart Site Strategy Call name and the `BOOKING_URL` and `buildArticleContext` exports, so the route, the widget and the SMS adapter are untouched. It is about 40% shorter than `main`.

- One product, described in Bruce's order (follow-up, conversation, content, changes, then the brain), with the offer doc's one-paragraph version given as the answer to "what is a Smart Site". The six parts are one line each, to be mentioned only when asked.
- A short facts list that now covers the questions visitors ask: price (quoted individually, monthly cost, never a figure or a range, say so once and stop apologising), rankings (redirected, what redirected means, no promise), GoHighLevel, timing, after hours, fit, the Analyzer, and what the twenty-minute Strategy Call is.
- "Answer first, then at most one question, and only when it helps" replaces "favour a question over explaining in the first 2-3 turns".
- The call to action fires only after a real answer, on price, getting started or talking to Adam, or after three exchanges with specifics. Once per conversation unless re-asked. "I want to talk to Adam" is answered with the booking in that reply.
- The site speaks as itself ("I") and refers to Adam by name. Proof is one point per reply, each once per conversation.
- Anti-slop rules written in as a short list (filler, AI vocabulary, dashes, semicolons, "most people", constructed antithesis is covered by "write the way Adam talks").
- The reply rules sit at the top, before the offer, and ask for three to five sentences and under 90 words. A word target at the bottom of a long prompt was being ignored; a sentence count near the top holds.
- "If it is not written in this prompt, do not say it." The earlier passes of this rewrite (four in all) kept inventing plausible detail to fill a reply: hosting in the monthly cost, "the follow-up starts the next business day", "it's had conversations with hundreds of people". Each one that showed up got a named exclusion in the facts list.

## Scorecard across the three runs

Mechanical counts over the 22 replies in each run.

| | Before (`0807259`) | Current (`main`) | After (this branch) |
|---|---|---|---|
| Average reply length (words) | 70 | 89 | 62 |
| Replies over 80 words | 8 | 14 | 4 |
| Longest reply (words) | 125 | 141 | 121 |
| Replies ending with a question | 20 of 22 | 19 of 22 | 2 of 22 |
| Conversations where the CTA buttons appeared | 1 | 2 | 3 |
| CTA replies | 2 | 3 | 3 |
| Invented dollar figures | 3 replies | none | none |
| Internal product names said to the visitor | 2 replies | 2 replies | none |
| Banned filler or "most people" | 2 | 2 | none |
| Em dashes, bullets | none | none | none |

The three CTA conversations after the rewrite are the ones that should have it: cost, the pricing push, and "I want to talk to Adam". It appears once in each, after the answer. In the pricing push it came on the third reply rather than the first, which is later than the rule asks for; the first two replies still answered the question. In the cost conversation the second reply, a push for "hundreds or thousands", gives no band and does not re-fire the marker.

What is still not perfect after the rewrite, for Adam to judge: the rankings answer still opens with "No." before giving the honest version. The blog reply applying the article to an eight-course business ran to 121 words. The chatbot answer says "the difference is whether the thing can think", which is a line, not a fact. Run to run the model varies, so a second run would not match this one word for word.

## The ten conversations, current prompt against the rebuilt prompt


### 1. What is a Smart Site

**Visitor:** What is a smart site?

*Current (main) (122 words):*

> A Smart Site is a website trained on your business that does the work of your sales team, your marketing department and your appointment setter, around the clock.
>
> It talks to every visitor, answers their questions, qualifies them and books them straight into your calendar. It writes and publishes your content every week, sends your emails, and follows up every inquiry in seconds. You direct it. The site does the work.
>
> Old websites sit there waiting for someone in the office to get to the form. A Smart Site never stops. No person, however good, can compete with a site that is trained on the business, decides live for every visitor, and never waits.
>
> What does your website do for you today?

*After (this branch) (72 words):*

> A Smart Site is a website that knows your business and does the marketing work itself. It talks to every visitor any hour and books the good ones into your calendar, follows up every inquiry so nobody is forgotten, writes the content that gets you found, and makes changes when you say so. You get more sales from the people already finding you, and you don't have to run any of it.

**Visitor:** So what would it actually do for my business? I run a training organisation, most of our enquiries come in through Facebook.

*Current (main) (141 words):*

> For a training organisation, it would do three things most owners are doing manually:
>
> First, it answers every Facebook inquiry in seconds with a personalised reply that references what the person asked about, qualifies them on fit, and books them into your calendar before a competitor even sees the notification.
>
> Second, it writes your weekly content in your voice, built to qualify readers on whether your training is right for them, and publishes it across your site and email list on schedule.
>
> Third, it picks up on people already engaging with you, commenting on posts or replying to emails, and continues those conversations in the right channel. Not cold outreach. Warm relationship building with people who already raised their hand.
>
> The part most training providers notice first is the Facebook follow-up. How fast are you getting back to inquiries right now?

*After (this branch) (104 words):*

> It would answer every Facebook inquiry in seconds with a personal reply that knows your training programs, then keep the conversation going until the person books or drops off. Right now, someone inquiring at 9pm waits until morning, and by then they've moved on or contacted someone else. The site also handles the follow-up automatically so good prospects don't get forgotten when your team is busy, and you'd see every inquiry in one dashboard: who came in, what was said, whether they booked.
>
> Since you're getting inquiries already, this makes more of them turn into sales without you having to check whether anyone replied.

**Visitor:** And what do I have to do once it's running?

*Current (main) (126 words):*

> About two hours during the build so the site learns your training programmes, your customers and the way you sell. After it goes live, a yes or a no on each piece of content before it goes out, and a glance at the dashboard whenever you like.
>
> That's it. The site handles the conversations, the follow-up, the content writing and publishing. You own the site, the content and everything it learned. If the relationship ends, it all stays with you.
>
> I eliminated 36 hours per week of personal marketing work from my own business this way while revenue increased. Tasks removed: blog writing, email writing, ad copy, image creation, content posting, ad performance analysis.
>
> What part of your marketing is eating the most time right now?

*After (this branch) (61 words):*

> About a yes or a no on each piece of content before it goes out, and a look at the dashboard whenever you like. That's it. The site handles the replies, the follow-up, the bookings and the content writing. You don't run any of it, you just decide whether each article sounds right before it's published and sent to your database.

### 2. What does it cost

**Visitor:** How much does it cost?

*Current (main) (64 words, CTA buttons shown):*

> Every Smart Site is quoted individually after a Strategy Call. The build depends on the size of the site and what's already there. After it goes live there's a monthly cost to run it.
>
> Two ways to go from here: run your site through the analyzer and see where it is losing enquiries, or if you want it fixed, book a chat with Adam.

*After (this branch) (69 words, CTA buttons shown):*

> Every Smart Site is quoted individually, because each one is built around a different business and the way it sells. It takes over work you're paying people and agencies to do now. The number comes from what your site needs.
>
> From here you can run your site through the free analyzer to see where it's losing inquiries, or book a chat with Adam if you'd rather talk it through.

**Visitor:** Roughly though. Are we talking hundreds a month or thousands?

*Current (main) (59 words, CTA buttons shown):*

> Thousands. The build is priced individually, and the monthly cost to run it reflects what it replaces: your sales team's follow-up, your marketing department's output, your appointment setter's calendar management, and your web developer's retainer.
>
> The Strategy Call works out the exact scope and the quote. Worth the conversation if you want those jobs done without you running them.

*After (this branch) (30 words):*

> I don't have the number because the quote is built from what your site needs. From here, the analyzer or a chat with Adam is where the number comes from.

### 3. Will I lose my rankings

**Visitor:** We rank pretty well on Google for a few of our courses. If you rebuild the site will I lose that?

*Current (main) (78 words):*

> No. When a site already ranks well, it moves onto a Smart Site with every page redirected so the rankings carry over. The structure changes, the rankings stay.
>
> What typically happens after: the site starts publishing weekly content trained on your voice and methodology, optimised for both Google and AI search. Rankings often improve from there because the site is producing and publishing consistently, not waiting for you to write it.
>
> Which courses rank well for you now?

*After (this branch) (50 words):*

> No. Every page is redirected, so the addresses Google knows carry over to the new site. That gives your rankings the best chance of coming with you. Nobody can promise Google won't move anything, but redirects are how you protect what you've got, and that's built in from the start.

**Visitor:** What does redirected mean in plain terms?

*Current (main) (89 words):*

> When someone clicks an old link or Google sends them to your old page, the server automatically sends them to the matching new page instead. Google sees the redirect and transfers the ranking authority to the new page.
>
> It's the standard way to move a site without losing search position. Done properly, Google treats the new page as the continuation of the old one.
>
> Are the courses that rank well now the ones bringing in your best leads, or is there a gap between what ranks and what converts?

*After (this branch) (58 words):*

> The old address sends the visitor, and Google, to the same page on the new site. So if someone clicks a link to your old course page or Google has it indexed, they land on that course page on the Smart Site. Google sees the connection and treats the new address as the continuation of the old one.

### 4. How is it different from a chatbot

**Visitor:** Isn't this just a chatbot? We had one on our site last year and people hated it.

*Current (main) (102 words):*

> Not the same thing. 
>
> A chatbot is programmed with fixed answers, so it sounds canned and can't go off script. This is an AI agent trained on the business: it decides live what to say based on the actual conversation. It knows your services, your methodology, how you sell, and it's had real conversations with hundreds of people by now.
>
> The proof: you're using it. Every appointment in my calendar since June 30 was booked by this site. It started the conversation, answered the questions, worked out the fit, and booked the call. Every one.
>
> What made people hate the old one?

*After (this branch) (92 words):*

> No. A chatbot runs scripts: if someone says X, reply with Y. It can't decide anything, so it either gives the same canned answer to everyone or it breaks. This is a trained AI that knows Adam's business and works out what you need live. It answers the actual question, qualifies whether there's a fit, and books you in if there is one. It's not guessing at keywords or handing you off to a form. The difference is whether the thing can think or whether it's following instructions someone wrote last year.

**Visitor:** What stops it making things up about my courses?

*Current (main) (94 words):*

> It only knows what you teach it during the build.
>
> Before anything goes live, the agent learns your courses properly. You walk through each one: what it covers, who it's for, how it works, what it costs, what results people get. That all gets encoded. The agent can't invent a course that doesn't exist or promise an outcome you didn't train it on.
>
> After it's live, you can update it anytime. New course, new price, new intake process, you tell it and it knows. No developer to chase.
>
> What courses are you running now?

*After (this branch) (79 words):*

> The site only knows what it learned about your business during the build and what you tell it after. When it doesn't know something, it says so. It won't invent a course detail or a price you never gave it. That's why the build starts with about two hours of your time: the site learns your services, your customers and the way you sell properly, so it can answer from what's real instead of filling gaps with plausible-sounding nonsense.

### 5. Can it book appointments

**Visitor:** Can it actually book appointments into my calendar? We run everything through GoHighLevel.

*Current (main) (88 words):*

> Yes. The site conversation agent books directly into your calendar through GoHighLevel. Every appointment in Adam's calendar since June 30 was booked this way: the site started the conversation, answered the questions, worked out the fit and booked the call.
>
> The setup connects to your GHL calendar so when someone is ready, they see your actual availability and pick a slot. No back-and-forth, no forms to follow up on later.
>
> What are you using GHL for right now, mainly your calendar or running campaigns through it as well?

*After (this branch) (56 words):*

> Yes. It talks to visitors, works out whether they're a fit based on what you told it during the build, and books the qualified ones straight into your calendar. Since every Smart Site to date has been built inside GoHighLevel, it connects directly to your calendar there. The person shows up already knowing what you do.

**Visitor:** What happens if someone books who isn't a good fit?

*Current (main) (100 words):*

> The conversation agent qualifies them before it offers the calendar. It asks about their situation, their business, what they need, and it knows what a fit looks like for your business because it was trained on your services and your ideal customer during the build.
>
> If someone isn't a fit, the agent explains why and redirects them instead of booking. The people who land in your calendar already know what you do and why they belong there.
>
> That's different from a contact form where anyone can submit and you find out later. What's the worst-case bad-fit appointment you get now?

*After (this branch) (56 words):*

> It doesn't book them. During the build, you tell the site who counts as a fit for your business: the service they need, budget range, location, whatever matters to you. The conversation works that out before anyone gets on your calendar. If they're not a fit, the site tells them straight and doesn't waste the meeting.

### 6. What happens after hours

**Visitor:** What happens when someone enquires at 10pm on a Saturday?

*Current (main) (67 words):*

> Most business owners see the enquiry on Monday morning and reply by lunchtime. By then the prospect has moved on or booked with someone faster.
>
> A Smart Site replies in seconds. Every enquiry, every hour. The Speed-to-Lead Agent watches the forms, email and SMS around the clock and drafts a personalised reply before a competitor even sees the notification.
>
> What's happening to your weekend enquiries right now?

*After (this branch) (55 words):*

> They get a reply in seconds, and the conversation continues for as long as they keep responding. The site does not wait for Monday. If they drop off, reminders go out on your schedule so nobody is forgotten. Staff see the inquiry in the dashboard the next time they check, already answered or already booked.

**Visitor:** And if they reply to that, does it keep going or does it wait for my staff on Monday?

*Current (main) (82 words):*

> It keeps going. Every reply gets answered in seconds, not waiting for Monday. The conversation continues until the prospect is qualified and booked into your calendar, or until they stop replying.
>
> Your staff see it when they're back, but the work is already done. The enquiry was answered, the questions were handled, and if they were a fit, they're in the calendar.
>
> How many replies does a typical enquiry thread take before someone books or drops off in your business right now?

*After (this branch) (63 words):*

> It keeps going. The conversation runs live at 10pm, 2am, whenever. If the person is a fit, the site books them straight into the calendar. If they need more answers first, it gives them and moves them toward booking. Your staff see it all in the dashboard when they log in, but they do not have to be there for it to happen.

### 7. A question about a specific blog post (on the blog post "Why Your Contact Form Converts at 2%")

**Visitor:** Can you sum up the main point of this post for me?

*Current (main) (65 words):*

> A contact form converts around 2% because it's passive: it can't answer questions or qualify visitors, so most people leave instead of filling it out. 
>
> A conversation on the site does both, live, while the visitor is still there and interested. That's what turns more of the same visitors into qualified leads.
>
> What's stopping you from having that conversation happening on your site right now?

*After (this branch) (54 words):*

> The main point is that contact forms convert poorly (around 2%) because they're passive and make visitors do all the work. A conversation that talks to visitors, answers their questions immediately, and qualifies them on the spot converts far better than waiting for someone to fill in a form and hope for a reply.

**Visitor:** How does that apply to a training business with eight courses and one person on the enquiries desk?

*Current (main) (87 words):*

> Eight courses means eight sets of questions visitors arrive with. One person means every enquiry gets answered when that person is working, not when the visitor is there asking.
>
> A conversation on the site answers the course-specific questions live, works out which course fits their situation, and books them into the calendar qualified. The enquiries desk stops sorting through "just browsing" emails and starts taking calls with people who already know which course they want.
>
> Which of the eight courses pulls the most enquiries that don't convert?

*After (this branch) (121 words):*

> Right now, one person is trying to answer every inquiry about eight different courses, probably during office hours. They're juggling questions about content, dates, pricing and fit across all those courses, and most inquiries sit waiting until they get to them.
>
> A conversation on the site answers those questions the moment someone lands on a course page. It knows which course they're looking at, what it covers, when it runs and what it costs. It works out whether the person is the right fit for that course, and if they are, it books them straight into your calendar. The person on the desk sees fewer, better qualified inquiries, already answered and often already booked.
>
> What kind of courses are you running?

### 8. A pricing push

**Visitor:** What's the ballpark price? I'm not booking a call just to find out a number.

*Current (main) (85 words, CTA buttons shown):*

> Every Smart Site is quoted individually because the scope varies. A five-page service business site with one core offer is different from a multi-service operation with 30 pages and three lead magnets. The build cost reflects that. Monthly cost reflects what the site is running: conversation agent, content engine, follow-up automation, or all of it.
>
> Two ways to go from here: run your site through the analyzer and see where it is losing enquiries, or if you want it fixed, book a chat with Adam.

*After (this branch) (72 words):*

> The quote is built from what your site needs: what part of the marketing you want automated, whether you're building new or fixing what you've got, and how the system fits the way you sell. There isn't a standard package because no two businesses sell the same way. That's why the number comes from the call or the analyzer, where Adam can see what you're working with and what needs to change.

**Visitor:** Come on, you must have a starting price.

*Current (main) (123 words):*

> I genuinely don't have a figure to give you. Every quote starts with understanding what the business does, how many services it sells, what the current site looks like, and which parts of the Smart Site the owner wants running. That conversation happens on the Strategy Call, and Adam writes the quote from there.
>
> What I can tell you: the people who book that call are usually weighing it against one of four things they're already paying for. An agency retainer, a developer on contract, a marketing person in-house, or their own time running all of it. The question isn't the absolute number, it's what it replaces and whether it passes The Holiday Test.
>
> Which of those four are you currently paying for?

*After (this branch) (81 words):*

> I don't, because every Smart Site is quoted from what the business needs. One owner might want the conversation and follow-up on a site that's already built. Another needs the whole thing: new site, content engine, follow-up system. The scope changes the number, and I can't guess your scope without seeing your site or hearing how you sell. The analyzer shows you the three fixes that matter most, and the call works out whether there's a fit and what it costs.

**Visitor:** Fine. What's included in the monthly cost then?

*Current (main) (117 words):*

> The monthly cost covers what the site is actively running. If it's handling the on-site conversation agent, answering every visitor and booking calls, that's included. If it's publishing content weekly and sending it to the database, that's included. If the Speed-to-Lead Agent is replying to every form and email in seconds, that's included. If the owner is updating pages through the chat interface instead of chasing a developer, that's included.
>
> The exact monthly depends on which of those pieces the business is running. A site doing conversation and follow-up costs less than one running the full content ecosystem and outreach agent on top of it.
>
> What part of your marketing takes up the most time right now?

*After (this branch) (53 words, CTA buttons shown):*

> The site doing its jobs: the conversation on every page, the follow-up on every inquiry, the content written and published each week, and changes made when you ask for them. What's in your quote specifically is settled on the call, because it depends on what you need automated and how your business sells.

### 9. An off-topic question

**Visitor:** Can you help me write a job ad for a trainer?

*Current (main) (70 words):*

> That's outside my lane. I handle marketing automation: content, email, ads, lead generation, and AI agents for marketing functions.
>
> Hiring, job ads, and team building are better discussed with Adam directly. If you want to talk through how to remove yourself from marketing work so you have time for that kind of operational work, that's a conversation we can have.
>
> What does your website do for your marketing right now?

*After (this branch) (43 words):*

> I can't help with that. Writing job ads is outside what I do here. I focus on the website, the follow-up and the marketing work that books qualified people into the calendar. For hiring, you'll want someone who works in HR or recruitment.

**Visitor:** Ok. Do you do Facebook ads as well?

*Current (main) (109 words):*

> Yes. Facebook ads are part of the Marketing Ecosystem: the outbound side that runs paid advertising across ad platforms, social distribution, and broader marketing operations. It takes the content you have and runs the campaigns that put it in front of the right audience at the right cost.
>
> The piece that usually comes first is the content itself and what happens when someone clicks the ad. A lot of owners run ads to a site that waits instead of talks, or to a form no one replies to for hours. The ad spend works, the site doesn't.
>
> What happens when someone clicks through one of your ads right now?

*After (this branch) (39 words):*

> Yes, as part of the Marketing Ecosystem. The ads run as a system with the rest of the marketing, and the site makes the spend work harder because every inquiry gets answered in seconds. What are you running now?

### 10. I want to talk to Adam

**Visitor:** I want to talk to Adam.

*Current (main) (34 words):*

> You can book a chat with Adam here: https://adamsowden.com/book
>
> Those calls are about getting your marketing off your plate. What's the part of your marketing that takes up most of your week right now?

*After (this branch) (35 words, CTA buttons shown):*

> You can book a chat with Adam directly. It's a twenty minute call where you pick the one visitor path most worth fixing first and work out whether there's a fit. No pitch, no obligation.

**Visitor:** Is he available this week?

*Current (main) (45 words):*

> Check his calendar at that link and you'll see what's open. It updates live, so if there's a slot showing, it's yours to take.
>
> What's driving the timeline? Is something breaking in your marketing right now, or is this more about finally getting it sorted?

*After (this branch) (25 words):*

> The booking page shows what's open on his calendar. I can't see it from here, but when you click through you'll see the current availability.

## Appendix: the pre-rewrite prompt on the same ten

The prompt at `0807259`, the commit before the Smart Site rewrite, which Adam compared the current one against. Included so the comparison is three-way. Note the invented monthly prices in conversation 8.

### 1. What is a Smart Site

**Visitor:** What is a smart site?

*Before (0807259) (94 words):*

> A Smart Site is a website where every page can have a real conversation with every visitor. Not a static sales page. Not a chatbot that fumbles questions. A conversational AI that engages each person in their specific situation, answers their questions, qualifies them, and books appointments directly into the owner's calendar.
>
> You're experiencing one right now. I'm embedded on every page of Adam's site. The difference between this and a contact form is the difference between a conversation and a dead end.
>
> What's the biggest gap in how your site handles visitors today?

**Visitor:** So what would it actually do for my business? I run a training organisation, most of our enquiries come in through Facebook.

*Before (0807259) (125 words):*

> It turns every person who lands on your site into a qualified conversation before they leave. Right now, someone clicks through from Facebook, reads a page, maybe fills out a form if you're lucky. Most just leave.
>
> With a Smart Site, that visitor gets into a real conversation about their training needs while they're still on the page. I qualify them, answer their specific questions about your programs, handle objections, and book them into your calendar if they're ready. The enquiry happens in the moment, not days later when they've moved on.
>
> For a training organisation, the biggest win is usually handling the same questions over and over without you. What's the one question prospects ask that eats up most of your time right now?

**Visitor:** And what do I have to do once it's running?

*Before (0807259) (101 words):*

> Direct the strategy, review what the AI says occasionally, and take the booked calls.
>
> The AI handles every conversation. You set the parameters once: what qualifies someone, what your programs are, what questions to ask, how to handle objections, when to book. After that, it runs without you. No daily management, no monitoring conversations in real time, no writing replies.
>
> Most training organisation owners review the conversation transcripts weekly to see what prospects are asking, then adjust positioning or messaging if patterns emerge. Five minutes. That's it.
>
> What part of your current enquiry process takes up the most time each week?

### 2. What does it cost

**Visitor:** How much does it cost?

*Before (0807259) (49 words):*

> Cost varies depending on which piece of the system fits your situation best. The six products are modular, you can buy one or several, no required order. Some are fixed-price self-serve, others are scoped in a conversation.
>
> What part of your marketing is eating the most time right now?

**Visitor:** Roughly though. Are we talking hundreds a month or thousands?

*Before (0807259) (57 words):*

> Thousands. This is the workforce that runs your marketing without you, not a subscription tool.
>
> The self-serve entry point (Irene) starts lower. The full systems (Content Ecosystem, Marketing Ecosystem, the agents) are priced as the marketing function they replace, not as software.
>
> What's your current monthly marketing spend, including your own time at what you bill clients?

### 3. Will I lose my rankings

**Visitor:** We rank pretty well on Google for a few of our courses. If you rebuild the site will I lose that?

*Before (0807259) (73 words):*

> No. The Living AI Website preserves your existing URLs and content structure. Nothing breaks. Google sees the same pages at the same addresses.
>
> The difference is what happens after: the site writes new content on a schedule, optimises existing pages for search and AI answer engines, and keeps the whole thing current without you touching it.
>
> What are the courses, and how much of your lead flow comes through those rankings right now?

**Visitor:** What does redirected mean in plain terms?

*Before (0807259) (81 words):*

> When someone clicks an old link or Google shows an old URL, a redirect sends them to the right page automatically. They land where they need to be, even if the address changed.
>
> It's how sites prevent broken links when they move pages around. Your visitor never sees an error, Google doesn't penalise you, and the ranking authority transfers to the new location.
>
> Is this about moving your course pages, or are you asking because you've dealt with redirect problems before?

### 4. How is it different from a chatbot

**Visitor:** Isn't this just a chatbot? We had one on our site last year and people hated it.

*Before (0807259) (79 words):*

> Most chatbots are decision trees or generic AI that can't answer real questions. The conversation dies in two exchanges because the thing doesn't know anything about your business.
>
> This is different in one specific way: it's trained on the methodology, voice, and offer of the business it represents. It can have a real conversation because it actually knows what it's talking about. You're experiencing that right now.
>
> What happened with the chatbot you had? What made people hate it?

**Visitor:** What stops it making things up about my courses?

*Before (0807259) (89 words):*

> The training data. It only knows what you teach it about your courses: your methodology, your proof, your positioning, your voice. It can't invent what it wasn't trained on.
>
> When you ask it a question it doesn't have an answer for, it says "I don't know, let me get Adam" (or whoever owns the business). No hallucinations, no guessing.
>
> The risk isn't the AI making things up. The risk is training it on the wrong things. What's in your courses that a visitor needs to understand before they book?

### 5. Can it book appointments

**Visitor:** Can it actually book appointments into my calendar? We run everything through GoHighLevel.

*Before (0807259) (73 words):*

> Yes. It connects to any calendar system that accepts API integrations, including GoHighLevel. The conversation qualifies the prospect, answers their questions about your offer, and when they're ready, books the appointment directly into your calendar in real time.
>
> The prospect sees available slots, picks one, and it appears in your system immediately. No back-and-forth emails, no manual confirmation step.
>
> What's the part of your booking process that eats the most time right now?

**Visitor:** What happens if someone books who isn't a good fit?

*Before (0807259) (68 words):*

> The AI qualifies before it books. It asks the questions you'd ask in that first call, the ones that separate real prospects from time-wasters. If someone doesn't fit your criteria, it tells them that directly and doesn't offer booking.
>
> You set the qualification rules. The AI enforces them. No unqualified meetings appear in your calendar.
>
> What's your current process for filtering leads before they get on your calendar?

### 6. What happens after hours

**Visitor:** What happens when someone enquires at 10pm on a Saturday?

*Before (0807259) (93 words):*

> Most businesses lose that lead. The enquiry sits in the inbox until Monday morning. By then the prospect has already booked a call with someone who replied on Saturday night.
>
> The Speed-to-Lead Agent watches every channel around the clock and replies in seconds, before a competitor even sees the notification. When the lead came through the Diagnostic Tool first, the agent drafts its reply using the prospect's own words about their situation. Not a generic sequence. A personalised reply that references what they told you.
>
> Is slow follow-up costing you enquiries right now?

**Visitor:** And if they reply to that, does it keep going or does it wait for my staff on Monday?

*Before (0807259) (66 words):*

> It keeps going. The agent continues the conversation in real time, answers their questions, qualifies them, and books the call into your calendar. All weekend. All night. No staff required.
>
> The conversation only stops when the prospect stops replying or the call is booked.
>
> What's making you ask about staff involvement? Are you handling enquiries yourself right now, or is someone on the team doing it?

### 7. A question about a specific blog post (on the blog post "Why Your Contact Form Converts at 2%")

**Visitor:** Can you sum up the main point of this post for me?

*Before (0807259) (85 words):*

> A contact form converts poorly because it makes visitors do all the work with no immediate response. Most people leave rather than fill it out and wait for a reply that might never come.
>
> The fix is a conversation that happens on the page while the visitor is still there. It answers their question, qualifies whether they're a fit, and books the ones worth calling. You get fewer leads, but the ones you get are ready to buy.
>
> What brings you to the post today?

**Visitor:** How does that apply to a training business with eight courses and one person on the enquiries desk?

*Before (0807259) (110 words):*

> That's exactly where a conversation beats a form. One person handling enquiries for eight courses means most questions go unanswered, or they sit in a queue while the visitor moves on.
>
> A conversation on the site can answer the course fit questions immediately. Which industry are they in, what level are they starting from, which outcome matters most? The system qualifies them for the right course and books the call with the one person only when it's worth their time.
>
> The enquiries person stops answering the same questions fifty times and starts having real conversations with people already qualified. Which of the eight courses gets the most tyre-kickers right now?

### 8. A pricing push

**Visitor:** What's the ballpark price? I'm not booking a call just to find out a number.

*Before (0807259) (38 words):*

> Fair. The products range from $500/month for a self-serve AI worker up to $5,000/month for a full inbound content ecosystem. The Marketing Ecosystem (paid ads and outbound) starts at $10,000/month.
>
> Which one fits what you're trying to fix?

**Visitor:** Come on, you must have a starting price.

*Before (0807259) (37 words):*

> I just gave you the range. $500/month is the starting price for Irene, the self-serve AI marketing workers. $5,000/month for the Content Ecosystem. $10,000/month for the Marketing Ecosystem.
>
> What are you trying to get off your plate?

**Visitor:** Fine. What's included in the monthly cost then?

*Before (0807259) (46 words):*

> Depends which product. The $500/month workers do one recurring task, specialist standard, trained on your voice and methodology. The $5,000/month Content Ecosystem includes the Living AI Website, Weekly Content Engine, and Diagnostic Tool, all producing and publishing without you.
>
> Which sounds closer to what you need?

### 9. An off-topic question

**Visitor:** Can you help me write a job ad for a trainer?

*Before (0807259) (65 words):*

> I help business owners with their marketing automation, not with hiring or job ads. That's outside my lane.
>
> If you need a trainer because your marketing takes too much of your time and you're trying to free yourself up, we should talk about that. But the job ad itself is better handled by someone who does hiring work.
>
> What's driving the need for a trainer?

**Visitor:** Ok. Do you do Facebook ads as well?

*Before (0807259) (63 words):*

> Yes. Facebook ads are part of the Marketing Ecosystem, which runs paid advertising across platforms. It takes the content your business has and puts it in front of the right audience at the right cost.
>
> The system handles campaign setup, targeting, creative testing, budget management, and performance optimisation. You direct the strategy, the AI handles implementation.
>
> What's your current situation with Facebook ads?

### 10. I want to talk to Adam

**Visitor:** I want to talk to Adam.

*Before (0807259) (31 words, CTA buttons shown):*

> You can book a call with Adam directly using the link below. He'll walk through your marketing situation and which of the six systems makes sense for where you are now.

**Visitor:** Is he available this week?

*Before (0807259) (22 words, CTA buttons shown):*

> His calendar opens through the booking link. You'll see his real-time availability there and can grab a slot that works for you.

