# Hue controller for Slack

## Setup



## Basic actions

To get an overview of all possible actions, use the list command:

`/hue list`



You can use 4 basic actions:

on/off - turns the lights on or off
colorloop - sets the lights to the colorloop effect
hex color - sets the lights to a hex color (eg \#ff0000)
color-name - sets the lights to a human-readable color (eg. blue). There are 145 colors defined.

## Color names

There are 145 human-readable colors defined. The list can be found [here](http://).

Use a - instead of a space in the color name.

Otherwise, the following call will list 10 random colors you can use:

`/hue colors list`

## Controlling groups

You control the groups with the following syntax:

`/hue groups group-id action`

To get the group id's use the list action:

`/hue groups list`

You can control multiple groups at once by comma seperating multiple group id's:

`/hue groups 1,2 action`

You can add as many id's as you like, as long as they exist.

## Controlling lights

You control the lights with the following syntax:

`/hue lights light-id action`

To get the light id's use the list action:

`/hue groups list`

You can control multiple lights at once by comma seperating multiple light id's:

`/hue lights 1,2 action`

You can add as many id's as you like, as long as they exist.
