# Game Design Document: [App Name TBD]

## 1. Overview
**Concept**: A mobile application hosting a collection of rapid-fire, 2-player games designed to be played on a single device.
**Core Pillars**:
*   **2 Players**: All games are competitive or cooperative for two people.
*   **2 Minutes**: Games are quick to learn (instant) and quick to play (< 2 mins).
*   **Replayability**: High skill ceiling or addictive loops to encourage "just one more" match.
*   **Simplicity**: Minimalist interface, intuitive controls (mostly single tap/gesture).

## 2. Target Audience
*   **Context**: "Limbo Time" - Passengers in cars/transit, waiting in lines, or killing time before an event.
*   **Demographic**: Friends, couples, or bored peers sharing a device.
*   **Age rating**: Everyone (E).

## 3. Platform
*   **Primary**: Web (PWA).
*   **Form Factor**: Single device (shared screen) ONLY. Local multiplayer via split-screen.
*   **Tech Stack**: HTML/CSS/JS (Vanilla or lightweight framework), Service Workers for offline play.

## 4. Visual Style & Audio
*   **Aesthetics**: **Retro Pixel Art**. High contrast, chunky pixels, vibrant 8-bit color palette.
*   **Audio**: Chiptune music loops, bit-crushed sound effects (beeps, boops, explosions).

## 5. Game List

### Game 1: Bang! (High Noon Shooter)
*   **Genre**: Reaction / Rhythm
*   **Concept**: A classic standoff. The screen is split horizontally. Player 1 takes the top half (flipped), Player 2 takes the bottom.
*   **Gameplay**:
    *   A "Moderator" (voice/text) gives a series of distracting cues (e.g., "Ready...", "Steady...", "Banana!", "Draw...").
    *   Players must tap their side of the screen *only* when the specific "Shoot" cue is given (e.g., "BANG!").
    *   **Win Condition**: First player to tap after the correct cue wins the round.
    *   **Lose Condition**: Tapping early (foul) results in a loss of the round.
    *   **Format**: Best of 5 rounds (configurable).

### Game 2: Rowing Race (Rhythm Regatta)
*   **Genre**: Rhythm / Timing
*   **Concept**: Players are rowing a boat. A metronome/beat indicator moves or pulses.
*   **Gameplay**:
    *   Players must tap in sync with a rhythm to row efficiently.
    *   **Dynamic Factors**: Wind speed or water flow rate changes the required tempo or timing window.
    *   **Win Condition**: First to cross the finish line (distance based).
    *   **Mechanic**: Perfect taps give max speed; off-beat taps slow the boat down.

### Game 3: Math Duel (Brain Battle)
*   **Genre**: Puzzle / Speed
*   **Concept**: Simple arithmetic problems appear in the center (oriented for both).
*   **Gameplay**:
    *   A math problem (e.g., "5 + 7") is shown.
    *   Three possible answers appear on each player's side.
    *   **Win Condition**: First to tap the correct answer gets a point. First to 5 points wins.
    *   **Lose Condition**: Tapping a wrong answer deducts a point or freezes the player for 2 seconds.

### Game 4: Color Reflex (Stroop Test)
*   **Genre**: Cognitive / Reaction
*   **Concept**: Words for colors appear, but written in different font colors (e.g., the word "RED" written in blue ink).
*   **Gameplay**:
    *   The game asks a rule: "Tap when the *Color* matches the *Word*".
    *   Cards flash in the center.
    *   **Win Condition**: First to tap on a correct match wins the point.
    *   **Lose Condition**: Tapping on a mismatch loses a point.

## 6. User Interface (UI) / User Experience (UX)
*   **Main Menu**: Quick access to game list.
*   **Shuffle Mode**: A "Quick Play" button that cycles randomly through games. Once a game finishes, it automatically loads the next random game until the players exit.
*   **Settings**: Volume, Round counts, Player names/colors.

## 7. Monetization
*   **Free to Play**: Supported by Ads (interstitial between game cycles or banner).
*   **Premium**: *Out of scope for initial release.*
