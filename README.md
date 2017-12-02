# mineclimber

This html5/javascript platform was developed for the [Ludum Dare 29](http://ludumdare.com/compo/ludum-dare-29) game jam.

Keep in mind that due to the time restrictions (48h) to release the first working version of the game, there are probably some bugs and some inefficient code that can be optimised.

The code was heavily based on [Zomblocks Blockiller](http://github.com/lfpetrini/zomblocks) and works the same way.

Basically, we've got:

* A resource manager that is used to queue up the assets and has a callback function for when everything is downloaded;
* A state manager, which holds the current state of the game;
* Game states, each with its own methods for updating, drawing, starting and finishing;
* A main loop that is called continuously to update and draw the current state.

The main loop is used to update and draw the current game state, and the map is generated procedurally.

Since most of the calculations are done using the current game time, for each loop iteration, if the elapsed time since the last update exceeds the default frame time, then the current game time used is the sum of the last game time + default frame time. This guarantees a better overall consistency.

Ideally, only the updates (processing) should be done this way, and the drawing should be done after all the elapsed time was 'consumed' and updated.
