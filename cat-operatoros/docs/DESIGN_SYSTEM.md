# Design System

The brief is a tablet in a hot, bright, noisy cab, operated with gloves. The
visual language comes from instrument clusters and machine plates, not from
dashboards.

## Colour means state

This is the rule the whole palette hangs on. Green, amber, orange and red are
reserved for safety state and nothing else. Never use a state colour for a
button, a chart, a heading or an active tab.

```
steel-900   #151A1F   app background, cab dark
steel-800   #1E252C   card
steel-700   #28313A   raised / pressed
steel-600   #39444E   rules and edges

concrete-100 #E6E9EC  primary text
concrete-400 #98A4AE  secondary text and labels
concrete-600 #62707B  hint and disabled

state-safe      #2FA84F
state-attention #E8B10C
state-high      #F07319
state-critical  #E0353B

machine-amber   #FFC72C   identity only: active nav, machine ID plate
```

The amber is industrial-machine yellow and it is the one place the product
nods at the client's world. It must never mean "attention". Overloading it
destroys glance readability, which is the entire point of the interface.

High-contrast mode inverts to near-white with darkened state colours, for
direct sunlight. It is a real mode, not a filter: check contrast ratios after
switching.

## Type

One family, two roles. Barlow for everything, Barlow Condensed for machine
plates and large instrument readouts. Barlow is a low-contrast grotesk drawn
in the idiom of public and industrial signage, which is the right vernacular
here and is not the typeface anyone reaches for by default.

```
label   13px   labels only
body    15px   floor — this is read at arm's length
lg      18px
xl      22px
2xl     30px
3xl     44px   mission readouts
glance  64px   glance mode only
```

Every live number uses `.tabular` so figures do not jitter as telemetry ticks.

Sentence case throughout. No tracked-out all-caps eyebrows above headings.

## Layout

Single column, 8 px grid. Bottom navigation 88 px tall. Minimum tap target
64 px, well above the usual 44, because of gloves. Line length under 70
characters. Left aligned; centred text is harder to scan at a glance.

## Motion

One orchestrated moment in the entire product: the safety state transition. A
state change pulses once and settles. Nothing else animates.

No hover transitions on cards. No fade-and-slide entrances on sections. Those
are the default flourishes and they cost frame budget on a tablet for nothing.
Respect `prefers-reduced-motion`.

## Structure carries information

Borders and rules encode state boundaries, not decoration. Numbered markers
only where the content is genuinely a sequence, which here means the three
steps of the report flow and nothing else.

Spend the boldness in one place: the safety alert. Everything around it stays
quiet, so that when it fires, it is unmistakable.
