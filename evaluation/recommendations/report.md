# Évaluation des recommandations

Généré par `scripts/evaluate-recommendations.ts`. Pertinent = note >= 2. Les jeux non notés ne comptent ni comme pertinents ni comme hors sujet : leur nombre est indiqué.

> **Provisoire** : 584 notes sont des propositions (`claude-draft`) non relues.

## Moyennes sur 17 jeux de référence

| Variante | P@5 | P@10 | nDCG@10 | Hors sujet top 5 (moy.) | Non notés top 10 (total) |
|---|---|---|---|---|---|
| Ancienne règle (prod) | 0.11 | 0.09 | 0.11 | 3.4 | 0 |
| Descripteurs seuls | 0.75 | 0.68 | 0.69 | 0.1 | 0 |
| Embeddings seuls | 0.74 | 0.61 | 0.67 | 0.0 | 0 |
| Hybride | 0.79 | 0.68 | 0.72 | 0.2 | 0 |
| Hybride + MMR | 0.73 | 0.65 | 0.68 | 0.2 | 0 |

## RimWorld

| # | Ancienne règle (prod) | Descripteurs seuls | Embeddings seuls | Hybride | Hybride + MMR |
|---|---|---|---|---|---|
| 1 | CrossCode (0) | Oxygen Not Included (3) | Planetbase (2) | Oxygen Not Included (3) | Oxygen Not Included (3) |
| 2 | Portal Stories: Mel (0) | Ixion (2) | Oxygen Not Included (3) | Planetbase (2) | Planetbase (2) |
| 3 | VA-11 Hall-A: Cyberpunk Bartender Action (0) | Planetbase (2) | Surviving Mars (2) | Against the Storm (2) | Against the Storm (2) |
| 4 | Salt & Sanctuary (0) | Against the Storm (2) | Aven Colony (2) | Ixion (2) | Spacebase DF-9 (3) |
| 5 | Dark Souls II: Scholar of the First Sin (0) | Surviving The Aftermath (2) | Stranded: Alien Dawn (3) | Surviving The Aftermath (2) | Surviving The Aftermath (2) |
| 6 | Xenoblade Chronicles 3D (0) | They Are Billions (1) | Factorio (1) | Surviving Mars (2) | Ixion (2) |
| 7 | Chroma Squad (0) | Surviving Mars (2) | Per Aspera (1) | They Are Billions (1) | Factorio (1) |
| 8 | Bloodstained: Ritual of the Night (0) | Spacebase DF-9 (3) | Surviving The Aftermath (2) | Spacebase DF-9 (3) | They Are Billions (1) |
| 9 | Owlboy (0) | Stranded: Alien Dawn (3) | Startopia (2) | Stranded: Alien Dawn (3) | Stranded: Alien Dawn (3) |
| 10 | Deadbolt (0) | Banished (2) | Banished (2) | Banished (2) | Banished (2) |

Jeux pertinents connus pour ce jeu : 11.

| Variante | P@5 | P@10 | nDCG@10 | Hors sujet top 5 | Non notés top 10 |
|---|---|---|---|---|---|
| Ancienne règle (prod) | 0.00 | 0.00 | 0.00 | 5 | 0 |
| Descripteurs seuls | 1.00 | 0.90 | 0.87 | 0 | 0 |
| Embeddings seuls | 1.00 | 0.80 | 0.74 | 0 | 0 |
| Hybride | 1.00 | 0.90 | 0.88 | 0 | 0 |
| Hybride + MMR | 1.00 | 0.80 | 0.87 | 0 | 0 |

## Factorio

| # | Ancienne règle (prod) | Descripteurs seuls | Embeddings seuls | Hybride | Hybride + MMR |
|---|---|---|---|---|---|
| 1 | Ixion (1) | Nova Lands (2) | Nova Lands (2) | Nova Lands (2) | Nova Lands (2) |
| 2 | Mewgenics (0) | shapez.io (3) | SteamWorld Build (1) | Satisfactory (3) | RimWorld (1) |
| 3 | Timberborn (1) | Satisfactory (3) | The Planet Crafter (2) | Dyson Sphere Program (3) | Dyson Sphere Program (3) |
| 4 | Papa's Freezeria Deluxe (0) | Dyson Sphere Program (3) | Satisfactory (3) | shapez.io (3) | Satisfactory (3) |
| 5 | Library Of Ruina (0) | Against the Storm (1) | Dyson Sphere Program (3) | Against the Storm (1) | Against the Storm (1) |
| 6 | Cult of the Lamb (0) | RimWorld (1) | Planetbase (1) | RimWorld (1) | shapez.io (3) |
| 7 | Chroma Squad (0) | Per Aspera (1) | Per Aspera (1) | Per Aspera (1) | Per Aspera (1) |
| 8 | FTL: Faster Than Light (0) | shapez 2 (3) | Startopia (1) | Rise of Industry (2) | Supreme Commander 2 (0) |
| 9 | I Was a Teenage Exocolonist (0) | Age of Empires III (0) | RimWorld (1) | shapez 2 (3) | Anno 2205 (2) |
| 10 | Slay the Spire (0) | Rise of Industry (2) | Sins of a Solar Empire: Trinity (0) | The Planet Crafter (2) | The Riftbreaker (2) |

Jeux pertinents connus pour ce jeu : 9 (moins de 10 : P@10 plafonne à 0.9).

| Variante | P@5 | P@10 | nDCG@10 | Hors sujet top 5 | Non notés top 10 |
|---|---|---|---|---|---|
| Ancienne règle (prod) | 0.00 | 0.00 | 0.06 | 3 | 0 |
| Descripteurs seuls | 0.80 | 0.60 | 0.78 | 0 | 0 |
| Embeddings seuls | 0.80 | 0.40 | 0.52 | 0 | 0 |
| Hybride | 0.80 | 0.70 | 0.81 | 0 | 0 |
| Hybride + MMR | 0.60 | 0.60 | 0.65 | 0 | 0 |

## Stardew Valley

| # | Ancienne règle (prod) | Descripteurs seuls | Embeddings seuls | Hybride | Hybride + MMR |
|---|---|---|---|---|---|
| 1 | Abiotic Factor (0) | Coral Island (3) | Coral Island (3) | Coral Island (3) | Coral Island (3) |
| 2 | Mewgenics (0) | Dave The Diver (1) | Harvest Moon (3) | Story of Seasons: Pioneers of Olive Town (3) | Graveyard Keeper (2) |
| 3 | Library Of Ruina (0) | Story of Seasons: Pioneers of Olive Town (3) | Harvest Moon: Friends of Mineral Town (3) | My Time at Sandrock (3) | Story of Seasons: Pioneers of Olive Town (3) |
| 4 | Golf Story (0) | My Time at Sandrock (3) | My Time At Portia (3) | My Time At Portia (3) | Core Keeper (2) |
| 5 | Cult of the Lamb (1) | Graveyard Keeper (2) | Littlewood (2) | Littlewood (2) | Rune Factory: A Fantasy Harvest Moon (3) |
| 6 | Chroma Squad (0) | Core Keeper (2) | Farming Simulator 2013 (1) | Graveyard Keeper (2) | Dave The Diver (1) |
| 7 | I Was a Teenage Exocolonist (1) | Harvestella (2) | Rusty's Retirement (1) | Dave The Diver (1) | My Time at Sandrock (3) |
| 8 | Slay the Spire (0) | Littlewood (2) | Farm Together (2) | Harvestella (2) | Fantasy Life i: The Girl Who Steals Time (2) |
| 9 | Dredge (1) | My Time At Portia (3) | Plantera (1) | Core Keeper (2) | My Time At Portia (3) |
| 10 | HuniePop (0) | Farming Simulator 19 (1) | Luna's Fishing Garden (1) | Farm Together (2) | Littlewood (2) |

Jeux pertinents connus pour ce jeu : 13.

| Variante | P@5 | P@10 | nDCG@10 | Hors sujet top 5 | Non notés top 10 |
|---|---|---|---|---|---|
| Ancienne règle (prod) | 0.00 | 0.00 | 0.04 | 4 | 0 |
| Descripteurs seuls | 0.80 | 0.80 | 0.74 | 0 | 0 |
| Embeddings seuls | 1.00 | 0.60 | 0.76 | 0 | 0 |
| Hybride | 1.00 | 0.90 | 0.82 | 0 | 0 |
| Hybride + MMR | 1.00 | 0.90 | 0.82 | 0 | 0 |

## Cities: Skylines

| # | Ancienne règle (prod) | Descripteurs seuls | Embeddings seuls | Hybride | Hybride + MMR |
|---|---|---|---|---|---|
| 1 | Ixion (1) | Cities in Motion (1) | Cities: Skylines II (3) | Cities: Skylines II (3) | Cities: Skylines II (3) |
| 2 | The Movies (0) | Transport Fever 2 (2) | SimCity 4 (3) | Cities in Motion (1) | Cities in Motion (1) |
| 3 | Total War: Shogun 2 (0) | Cities: Skylines II (3) | Rise of Industry (1) | Transport Fever 2 (2) | Transport Fever 2 (2) |
| 4 | Harvest Moon (0) | Cities in Motion 2 (1) | Airborne Kingdom (2) | Cities in Motion 2 (1) | Cities in Motion 2 (1) |
| 5 | Timberborn (2) | Two Point Campus (1) | Anno 1800 (2) | Rise of Industry (1) | Planet Coaster (1) |
| 6 | The Hundred Line: Last Defense Academy (0) | Planet Zoo (1) | SimCity 2000 (3) | Cities XL Platinum (3) | Timberborn (2) |
| 7 | Sid Meier's Civilization VI (1) | Planet Coaster (1) | Transport Fever 2 (2) | Planet Coaster (1) | Two Point Campus (1) |
| 8 | Papa's Freezeria Deluxe (0) | Cities XL Platinum (3) | Cities in Motion 2 (1) | Planet Zoo (1) | Game Dev Tycoon (0) |
| 9 | Sid Meier's Civilization V (1) | Parkasaurus (1) | SteamWorld Build (2) | Two Point Campus (1) | Rise of Industry (1) |
| 10 | Nier (0) | Endzone - A World Apart (2) | Banished (2) | Parkasaurus (1) | Planet Zoo (1) |

Jeux pertinents connus pour ce jeu : 11.

| Variante | P@5 | P@10 | nDCG@10 | Hors sujet top 5 | Non notés top 10 |
|---|---|---|---|---|---|
| Ancienne règle (prod) | 0.20 | 0.10 | 0.12 | 3 | 0 |
| Descripteurs seuls | 0.40 | 0.40 | 0.47 | 0 | 0 |
| Embeddings seuls | 0.80 | 0.80 | 0.84 | 0 | 0 |
| Hybride | 0.40 | 0.30 | 0.57 | 0 | 0 |
| Hybride + MMR | 0.40 | 0.30 | 0.50 | 0 | 0 |

## Hades

| # | Ancienne règle (prod) | Descripteurs seuls | Embeddings seuls | Hybride | Hybride + MMR |
|---|---|---|---|---|---|
| 1 | The Song of Saya (0) | Hades II (3) | Hades II (3) | Hades II (3) | Hades II (3) |
| 2 | Call of Duty: Modern Warfare (2019) (0) | Ravenswatch (3) | Asterigos: Curse of the Stars (1) | Ravenswatch (3) | Ravenswatch (3) |
| 3 | Crash Team Racing Nitro-Fueled (0) | Curse of the Dead Gods (3) | Halls of Torment (1) | Curse of the Dead Gods (3) | Death's Door (2021) (2) |
| 4 | Subnautica: Below Zero (0) | Dungeon Souls (2) | Ravenswatch (3) | Dungeon Souls (2) | Curse of the Dead Gods (3) |
| 5 | Astral Chain (1) | Black Myth: Wukong (1) | Apotheon (1) | Heroes of Hammerwatch (2) | Black Myth: Wukong (1) |
| 6 | Super Mario Maker 2 (0) | Death's Door (2021) (2) | Titan Quest (1) | Tunche (2) | Dungeon Souls (2) |
| 7 | Witch on the Holy Night (0) | Nobody Saves the World (1) | Neon Abyss (2) | Dreamscaper (3) | Nobody Saves the World (1) |
| 8 | Hypnospace Outlaw (0) | Dreamscaper (3) | Torchlight (1) | Death's Door (2021) (2) | Tunche (2) |
| 9 | AI: The Somnium Files (0) | Moonlighter (2) | Delver (1) | Moonlighter (2) | God of War: Ragnarök (1) |
| 10 | Hedon (0) | Heroes of Hammerwatch (2) | God of War III (1) | Black Myth: Wukong (1) | Moonlighter (2) |

Jeux pertinents connus pour ce jeu : 10.

| Variante | P@5 | P@10 | nDCG@10 | Hors sujet top 5 | Non notés top 10 |
|---|---|---|---|---|---|
| Ancienne règle (prod) | 0.00 | 0.00 | 0.02 | 4 | 0 |
| Descripteurs seuls | 0.80 | 0.80 | 0.92 | 0 | 0 |
| Embeddings seuls | 0.40 | 0.30 | 0.58 | 0 | 0 |
| Hybride | 1.00 | 0.90 | 0.96 | 0 | 0 |
| Hybride + MMR | 0.80 | 0.70 | 0.83 | 0 | 0 |

## Hollow Knight

| # | Ancienne règle (prod) | Descripteurs seuls | Embeddings seuls | Hybride | Hybride + MMR |
|---|---|---|---|---|---|
| 1 | Fallout 4 (0) | Hollow Knight: Silksong (3) | Hollow Knight: Silksong (3) | Hollow Knight: Silksong (3) | Hollow Knight: Silksong (3) |
| 2 | Dishonored 2 (0) | Nine Sols (3) | Aeterna Noctis (3) | Ori and the Will of the Wisps (3) | Ori and the Will of the Wisps (3) |
| 3 | Unravel (0) | Ori and the Will of the Wisps (3) | Ori and the Will of the Wisps (3) | Nine Sols (3) | Rain World (2) |
| 4 | Horizon Zero Dawn (0) | Rain World (2) | Souldiers (2) | Rain World (2) | Nine Sols (3) |
| 5 | Broken Age: The Complete Adventure (0) | Shantae: Half-Genie Hero (1) | Afterimage (3) | Souldiers (2) | Volgarr the Viking (1) |
| 6 | Gears of War: Ultimate Edition (0) | Prince of Persia: The Lost Crown (3) | Valdis Story: Abyssal City (2) | Afterimage (3) | Blasphemous (3) |
| 7 | South Park: The Fractured But Whole (0) | Foregone (2) | Lost Ruins (2) | Prince of Persia: The Lost Crown (3) | Prince of Persia: The Lost Crown (3) |
| 8 | Dark Souls III (1) | Momodora: Reverie Under the Moonlight (3) | Monster Sanctuary (1) | Haiku, the Robot (3) | Aquaria (2) |
| 9 | Firewatch (0) | Blasphemous (3) | Haiku, the Robot (3) | Foregone (2) | Dead Cells (2) |
| 10 | Inside My Radio (0) | Souldiers (2) | Lone Fungus (3) | Blasphemous (3) | Dex (1) |

Jeux pertinents connus pour ce jeu : 18.

| Variante | P@5 | P@10 | nDCG@10 | Hors sujet top 5 | Non notés top 10 |
|---|---|---|---|---|---|
| Ancienne règle (prod) | 0.00 | 0.00 | 0.01 | 5 | 0 |
| Descripteurs seuls | 0.80 | 0.90 | 0.79 | 0 | 0 |
| Embeddings seuls | 1.00 | 0.90 | 0.80 | 0 | 0 |
| Hybride | 1.00 | 1.00 | 0.86 | 0 | 0 |
| Hybride + MMR | 0.80 | 0.80 | 0.73 | 0 | 0 |

Pertinents manqués par l'hybride : Blasphemous II.

## Celeste

| # | Ancienne règle (prod) | Descripteurs seuls | Embeddings seuls | Hybride | Hybride + MMR |
|---|---|---|---|---|---|
| 1 | Disgaea 5 Complete (0) | The End Is Nigh (3) | Jusant (1) | The End Is Nigh (3) | The End Is Nigh (3) |
| 2 | Fire Emblem Echoes: Shadows of Valentia (0) | Jump King (2) | Omno (1) | Jump King (2) | Jump King (2) |
| 3 | Yakuza 0 (0) | Super Meat Boy (3) | Jump King (2) | Super Meat Boy (3) | Animal Well (1) |
| 4 | The Frostrune (0) | Lone Fungus (1) | Thomas Was Alone (1) | Lone Fungus (1) | Super Meat Boy (3) |
| 5 | Dark Souls III: The Ringed City (0) | SANABI (2) | Mutant Mudds (2) | SANABI (2) | SANABI (2) |
| 6 | Mario Kart 8 Deluxe (0) | Prince of Persia: The Lost Crown (1) | Semblance (1) | Dustforce (3) | Night in the Woods (0) |
| 7 | VRChat (0) | Kaze and the Wild Masks (2) | Insurmountable (0) | Bloody Trapland (2) | Lone Fungus (1) |
| 8 | Stories Untold (0) | You Have 10 Seconds (2) | Ovivo (1) | Bread & Fred (1) | The King's Bird (2) |
| 9 | Shadows of Adam (0) | Momodora: Reverie Under the Moonlight (1) | Youropa (1) | Animal Well (1) | Chasm (1) |
| 10 | Pillars of Eternity II: Deadfire (0) | Slime-san (3) | Getting Over It with Bennett Foddy (2) | Prince of Persia: The Lost Crown (1) | Bloody Trapland (2) |

Jeux pertinents connus pour ce jeu : 12.

| Variante | P@5 | P@10 | nDCG@10 | Hors sujet top 5 | Non notés top 10 |
|---|---|---|---|---|---|
| Ancienne règle (prod) | 0.00 | 0.00 | 0.00 | 5 | 0 |
| Descripteurs seuls | 0.80 | 0.70 | 0.78 | 0 | 0 |
| Embeddings seuls | 0.40 | 0.30 | 0.27 | 0 | 0 |
| Hybride | 0.80 | 0.60 | 0.77 | 0 | 0 |
| Hybride + MMR | 0.80 | 0.60 | 0.67 | 0 | 0 |

## Slay the Spire

| # | Ancienne règle (prod) | Descripteurs seuls | Embeddings seuls | Hybride | Hybride + MMR |
|---|---|---|---|---|---|
| 1 | I Was a Teenage Exocolonist (1) | Banners of Ruin (3) | Spin Hero (2) | Griftlands (3) | Griftlands (3) |
| 2 | Chroma Squad (0) | Griftlands (3) | Across the Obelisk (3) | Solitairica (2) | Solitairica (2) |
| 3 | Into the Breach (1) | Solitairica (2) | Gordian Quest (3) | Across the Obelisk (3) | Banners of Ruin (3) |
| 4 | Chrono Ark (3) | Monster Slayers (3) | Roguebook (3) | Banners of Ruin (3) | Roguebook (3) |
| 5 | Mewgenics (1) | Across the Obelisk (3) | Monster Slayers (3) | Monster Slayers (3) | Monster Slayers (3) |
| 6 | Library Of Ruina (2) | Roguebook (3) | Backpack Hero (2) | Roguebook (3) | Across the Obelisk (3) |
| 7 | SteamWorld Heist (0) | Iris and the Giant (3) | Dicey Dungeons (2) | Monster Train (3) | Backpack Hero (2) |
| 8 | Cult of the Lamb (0) | Monster Train (3) | Nowhere Prophet (3) | Iris and the Giant (3) | Dicey Dungeons (2) |
| 9 | Braveland Pirate (0) | Astrea: Six-Sided Oracles (3) | Deep Sky Derelicts (2) | Astrea: Six-Sided Oracles (3) | Monster Train (3) |
| 10 | Evoland 2 (0) | Shogun Showdown (2) | Hand of Fate 2 (2) | Backpack Hero (2) | Iris and the Giant (3) |

Jeux pertinents connus pour ce jeu : 19.

| Variante | P@5 | P@10 | nDCG@10 | Hors sujet top 5 | Non notés top 10 |
|---|---|---|---|---|---|
| Ancienne règle (prod) | 0.20 | 0.20 | 0.19 | 1 | 0 |
| Descripteurs seuls | 1.00 | 1.00 | 0.90 | 0 | 0 |
| Embeddings seuls | 1.00 | 1.00 | 0.71 | 0 | 0 |
| Hybride | 1.00 | 1.00 | 0.88 | 0 | 0 |
| Hybride + MMR | 1.00 | 1.00 | 0.84 | 0 | 0 |

Pertinents manqués par l'hybride : Chrono Ark, Library Of Ruina.

## The Witcher 3: Wild Hunt

| # | Ancienne règle (prod) | Descripteurs seuls | Embeddings seuls | Hybride | Hybride + MMR |
|---|---|---|---|---|---|
| 1 | Dragon Age: Origins - Ultimate Edition (2) | The Witcher (2) | The Witcher 2: Assassins of Kings (3) | The Witcher (2) | The Witcher (2) |
| 2 | The Legend of Zelda: Breath of the Wild (2) | Elden ring (2) | Tainted Grail: The Fall of Avalon (2) | Elden ring (2) | Elden ring (2) |
| 3 | Etrian Odyssey II: Heroes of Lagaard (0) | Ni no Kuni: Wrath of the White Witch (1) | Dread Delusion (1) | Middle-Earth: Shadow of War (1) | Middle-Earth: Shadow of War (1) |
| 4 | Shin Megami Tensei: Strange Journey (0) | Risen 3: Titan Lords (2) | Lords of the Fallen (1) | Kingdom Come: Deliverance (3) | Kingdom Come: Deliverance (3) |
| 5 | Fire Emblem: Three Houses (0) | Dragon's Dogma II (2) | Demonicon (1) | The Elder Scrolls III: Morrowind (2) | Ni no Kuni: Wrath of the White Witch (1) |
| 6 | The Legend of Heroes: Trails of Cold Steel II (1) | Middle-Earth: Shadow of War (1) | Wytchwood (0) | Ni no Kuni: Wrath of the White Witch (1) | Risen 3: Titan Lords (2) |
| 7 | Final Fantasy VII Rebirth (2) | Middle-Earth: Shadow of Mordor - Game of the Year (1) | Gothic (2) | Middle-Earth: Shadow of Mordor - Game of the Year (1) | Tainted Grail: The Fall of Avalon (2) |
| 8 | Darkest Dungeon (0) | The Elder Scrolls III: Morrowind - Game of the Year Edition (2) | Pillars of Eternity (1) | Gothic (2) | Hogwarts Legacy (2) |
| 9 | Lords of Xulima (0) | The Elder Scrolls IV: Oblivion - Game of the Year Edition (2) | BLACKTAIL (1) | The Elder Scrolls V: Skyrim (3) | The Elder Scrolls V: Skyrim (3) |
| 10 | The Witcher 3: Wild Hunt - Game of the Year Edition (0) | Kingdom Come: Deliverance (3) | Diablo IV (1) | Dragon's Dogma II (2) | Dragon's Dogma II (2) |

Jeux pertinents connus pour ce jeu : 18.

| Variante | P@5 | P@10 | nDCG@10 | Hors sujet top 5 | Non notés top 10 |
|---|---|---|---|---|---|
| Ancienne règle (prod) | 0.40 | 0.30 | 0.26 | 3 | 0 |
| Descripteurs seuls | 0.80 | 0.70 | 0.52 | 0 | 0 |
| Embeddings seuls | 0.40 | 0.30 | 0.51 | 0 | 0 |
| Hybride | 0.80 | 0.70 | 0.59 | 0 | 0 |
| Hybride + MMR | 0.60 | 0.80 | 0.62 | 0 | 0 |

Pertinents manqués par l'hybride : Dragon Age: Inquisition - Game of the Year Edition, Dragon Age: Origins - Ultimate Edition, Final Fantasy VII Rebirth, Red Dead Redemption 2, The Legend of Zelda: Breath of the Wild.

## Disco Elysium

| # | Ancienne règle (prod) | Descripteurs seuls | Embeddings seuls | Hybride | Hybride + MMR |
|---|---|---|---|---|---|
| 1 | Shadowrun: Dragonfall - Director's Cut (2) | The Council (2018) (2) | Gamedec (3) | The Forgotten City (2021) (2) | The Forgotten City (2021) (2) |
| 2 | The Surge 2 (0) | The Forgotten City (2021) (2) | The Thaumaturge (3) | The Council (2018) (2) | Pathologic 2 (2) |
| 3 | Yakuza 4 (0) | Pathologic 2 (2) | Roadwarden (3) | Pathologic 2 (2) | The Witcher (1) |
| 4 | In Stars And Time (1) | This is the Police (1) | Who's Lila? (1) | Paradise Killer (2) | This is the Police (1) |
| 5 | Golden Sun (0) | Paradise Killer (2) | Gemini Rue (1) | This is the Police (1) | OMORI (1) |
| 6 | Ys Seven (0) | Pillars of Eternity II: Deadfire (2) | As Dusk Falls (1) | The Thaumaturge (3) | The Council (2018) (2) |
| 7 | Onimusha: Way of the Sword (0) | ELEX (1) | Whispers of a Machine (2) | The Deed (1) | A Plague Tale: Requiem (0) |
| 8 | Castlevania Advance Collection (0) | OMORI (1) | Leviathan: The Last Day of the Decade (1) | OMORI (1) | Lies of P (0) |
| 9 | Diablo III: Eternal Collection (0) | The Deed (1) | Heavy Rain (1) | The Witcher (1) | The Deed (1) |
| 10 | Dying Light: The Following - Enhanced Edition (0) | Biomutant (0) | Eternal Threads (1) | Why Am I Dead At Sea (1) | Paradise Killer (2) |

Jeux pertinents connus pour ce jeu : 12.

| Variante | P@5 | P@10 | nDCG@10 | Hors sujet top 5 | Non notés top 10 |
|---|---|---|---|---|---|
| Ancienne règle (prod) | 0.20 | 0.10 | 0.15 | 3 | 0 |
| Descripteurs seuls | 0.80 | 0.50 | 0.45 | 0 | 0 |
| Embeddings seuls | 0.60 | 0.40 | 0.81 | 0 | 0 |
| Hybride | 0.80 | 0.50 | 0.53 | 0 | 0 |
| Hybride + MMR | 0.40 | 0.40 | 0.38 | 0 | 0 |

Pertinents manqués par l'hybride : Shadowrun: Dragonfall - Director's Cut, The Case of the Golden Idol, The Rise of the Golden Idol.

## XCOM 2

| # | Ancienne règle (prod) | Descripteurs seuls | Embeddings seuls | Hybride | Hybride + MMR |
|---|---|---|---|---|---|
| 1 | Fire Emblem: Path of Radiance (1) | Xenonauts (3) | XCOM: Chimera Squad (3) | Xenonauts (3) | Xenonauts (3) |
| 2 | Triangle Strategy (1) | X-COM: UFO Defense (3) | Xenonauts (3) | X-COM: UFO Defense (3) | X-COM: UFO Defense (3) |
| 3 | Valkyria Chronicles 4 (2) | Phantom Doctrine (3) | UFO: Aftermath (3) | Sid Meier's Civilization: Beyond Earth (0) | Sid Meier's Civilization: Beyond Earth (0) |
| 4 | Valkyria Chronicles (2) | Jagged Alliance 3 (3) | UFO: Afterlight (3) | Jagged Alliance 3 (3) | Wasteland 3 (2) |
| 5 | Final Fantasy Tactics (1) | Valkyria Chronicles 4 (2) | Frozen Synapse (1) | Phantom Doctrine (3) | Jagged Alliance 3 (3) |
| 6 | Valkyria Chronicles Remastered (2) | Wasteland 3 (2) | Sid Meier's Alpha Centauri (0) | Wasteland 3 (2) | Frozen Synapse (1) |
| 7 | Final Fantasy Tactics: The War of the Lions (1) | Battle Brothers (2) | Aliens: Dark Descent (2) | Warhammer 40,000: Battlesector (2) | Phantom Doctrine (3) |
| 8 | Jagged Alliance 3 (3) | Warhammer 40,000: Battlesector (2) | Warp (0) | Valkyria Chronicles 4 (2) | Fallout Tactics: Brotherhood of Steel (2) |
| 9 | XCOM: Enemy Unknown (3) | Sid Meier's Civilization: Beyond Earth (0) | Alien Shooter 2: Reloaded (0) | Battle Brothers (2) | Sid Meier's Civilization V (0) |
| 10 | Fire Emblem: The Sacred Stones (1) | Fallout Tactics: Brotherhood of Steel (2) | Mutant Year Zero: Road to Eden (3) | Sid Meier's Civilization V (0) | The Banner Saga 2 (2) |

Jeux pertinents connus pour ce jeu : 18.

| Variante | P@5 | P@10 | nDCG@10 | Hors sujet top 5 | Non notés top 10 |
|---|---|---|---|---|---|
| Ancienne règle (prod) | 0.40 | 0.50 | 0.35 | 0 | 0 |
| Descripteurs seuls | 1.00 | 0.90 | 0.75 | 0 | 0 |
| Embeddings seuls | 0.80 | 0.60 | 0.70 | 0 | 0 |
| Hybride | 0.80 | 0.80 | 0.69 | 1 | 0 |
| Hybride + MMR | 0.80 | 0.70 | 0.65 | 1 | 0 |

Pertinents manqués par l'hybride : Valkyria Chronicles, Valkyria Chronicles Remastered, XCOM: Enemy Unknown.

## Sid Meier's Civilization VI

| # | Ancienne règle (prod) | Descripteurs seuls | Embeddings seuls | Hybride | Hybride + MMR |
|---|---|---|---|---|---|
| 1 | Total War: Shogun 2 (1) | Humankind (3) | Humankind (3) | Humankind (3) | Humankind (3) |
| 2 | Sid Meier's Civilization V (3) | Endless Legend (3) | Sid Meier's Civilization III (3) | Sid Meier's Civilization: Beyond Earth (3) | Sid Meier's Civilization: Beyond Earth (3) |
| 3 | Chroma Squad (0) | Age of Wonders 4 (2) | Sid Meier's Civilization IV: Colonization (3) | Endless Legend (3) | Endless Legend (3) |
| 4 | I Was a Teenage Exocolonist (0) | Sid Meier's Civilization: Beyond Earth (3) | Galactic Civilizations II: Ultimate Edition (2) | Sid Meier's Civilization IV: Colonization (3) | Sid Meier's Civilization IV: Colonization (3) |
| 5 | Final Fantasy Tactics: The War of the Lions (0) | Warhammer 40,000: Gladius - Relics of War (2) | Galactic Civilizations III (2) | Galactic Civilizations III (2) | Galactic Civilizations III (2) |
| 6 | Slay the Spire (0) | Galactic Civilizations III (2) | Europa Universalis III (2) | Galactic Civilizations II: Ultimate Edition (2) | Age of Wonders 4 (2) |
| 7 | Mewgenics (0) | Sid Meier's Civilization IV: Colonization (3) | Endless Legend (3) | Age of Wonders 4 (2) | Total War Saga: TROY (1) |
| 8 | Into the Breach (0) | Total War Saga: TROY (1) | The Battle of Polytopia (2) | Warhammer 40,000: Gladius - Relics of War (2) | Warhammer 40,000: Gladius - Relics of War (2) |
| 9 | Library Of Ruina (0) | Galactic Civilizations II: Ultimate Edition (2) | Europa Universalis IV (2) | Total War Saga: TROY (1) | Galactic Civilizations II: Ultimate Edition (2) |
| 10 | King's Bounty: The Legend (1) | Might & Magic: Heroes VII (1) | Victoria 3 (2) | Total War Saga: Thrones of Britannia (1) | Omerta: City of Gangsters (0) |

Jeux pertinents connus pour ce jeu : 14.

| Variante | P@5 | P@10 | nDCG@10 | Hors sujet top 5 | Non notés top 10 |
|---|---|---|---|---|---|
| Ancienne règle (prod) | 0.20 | 0.10 | 0.21 | 3 | 0 |
| Descripteurs seuls | 1.00 | 0.80 | 0.82 | 0 | 0 |
| Embeddings seuls | 1.00 | 1.00 | 0.87 | 0 | 0 |
| Hybride | 1.00 | 0.80 | 0.85 | 0 | 0 |
| Hybride + MMR | 1.00 | 0.80 | 0.83 | 0 | 0 |

Pertinents manqués par l'hybride : Sid Meier's Civilization V.

## Portal 2

| # | Ancienne règle (prod) | Descripteurs seuls | Embeddings seuls | Hybride | Hybride + MMR |
|---|---|---|---|---|---|
| 1 | Primordia (0) | Portal (3) | Portal (3) | Portal (3) | Portal (3) |
| 2 | Prince of Persia: The Two Thrones (0) | Trine 2 (1) | Portal Stories: VR (2) | Trine 2 (1) | Mirror's Edge (1) |
| 3 | Prince of Persia: Warrior Within (0) | Mirror's Edge (1) | Polarity (3) | Quantum Conundrum (3) | Trine 2 (1) |
| 4 | Professor Layton and the Curious Village (1) | Trine 3: The Artifacts of Power (1) | The Talos Principle II (3) | Mirror's Edge (1) | Quantum Conundrum (3) |
| 5 | Professor Layton and the Diabolical Box (1) | Quantum Conundrum (3) | Gateways (2) | Viewfinder (3) | Viewfinder (3) |
| 6 | Professor Layton and the Miracle Mask (1) | Viewfinder (3) | Pid (1) | Trine 3: The Artifacts of Power (1) | Iconoclasts (0) |
| 7 | Professor Layton and the Unwound Future (1) | Iconoclasts (0) | Antichamber (3) | Supraland (2) | Supraland (2) |
| 8 | Project Gotham Racing 2 (0) | Human: Fall Flat (1) | Inside (1) | Iconoclasts (0) | BattleBlock Theater (1) |
| 9 | Project Gotham Racing 3 (0) | Supraland (2) | ChromaGun (3) | Human: Fall Flat (1) | de Blob (0) |
| 10 | Psychonauts (1) | Phogs! (1) | Lightmatter (3) | Rochard (1) | Hamilton's Great Adventure (1) |

Jeux pertinents connus pour ce jeu : 13.

| Variante | P@5 | P@10 | nDCG@10 | Hors sujet top 5 | Non notés top 10 |
|---|---|---|---|---|---|
| Ancienne règle (prod) | 0.00 | 0.00 | 0.06 | 3 | 0 |
| Descripteurs seuls | 0.40 | 0.40 | 0.48 | 0 | 0 |
| Embeddings seuls | 1.00 | 0.80 | 0.75 | 0 | 0 |
| Hybride | 0.60 | 0.40 | 0.51 | 0 | 0 |
| Hybride + MMR | 0.60 | 0.40 | 0.49 | 0 | 0 |

Pertinents manqués par l'hybride : Superliminal, The Turing Test.

## Subnautica

| # | Ancienne règle (prod) | Descripteurs seuls | Embeddings seuls | Hybride | Hybride + MMR |
|---|---|---|---|---|---|
| 1 | Clair Obscur: Expedition 33 (0) | FarSky (3) | FarSky (3) | FarSky (3) | FarSky (3) |
| 2 | Chrono Ark (0) | Under The Waves (2) | Subnautica 2 (3) | Narcosis (1) | Theblu (1) |
| 3 | The House in Fata Morgana (0) | Narcosis (1) | Narcosis (1) | Under The Waves (2) | Narcosis (1) |
| 4 | Hollow Knight: Silksong (0) | Breathedge (2) | Stranded Deep (2) | Stranded Deep (2) | Under The Waves (2) |
| 5 | Sea of Stars (0) | How to Survive 2 (1) | Creativerse (1) | Volcanoids (1) | Breathedge (2) |
| 6 | Path of Exile (0) | Grounded (2) | Abiotic Factor (2) | Theblu (1) | Miasmata (2) |
| 7 | Pathologic 2 (1) | Conan Exiles (1) | Barotrauma (2) | Breathedge (2) | Stranded Deep (2) |
| 8 | Hades II (0) | Volcanoids (1) | The Planet Crafter (3) | Green Hell (2) | Sons of The Forest (2) |
| 9 | Deponia: The Complete Journey (0) | Green Hell (2) | Sons of The Forest (2) | Necesse (1) | Subnautica 2 (3) |
| 10 | Rogue Legacy 2 (0) | Voidtrain (2) | Astroneer (2) | Astroneer (2) | Don't Starve (1) |

Jeux pertinents connus pour ce jeu : 16.

| Variante | P@5 | P@10 | nDCG@10 | Hors sujet top 5 | Non notés top 10 |
|---|---|---|---|---|---|
| Ancienne règle (prod) | 0.00 | 0.00 | 0.02 | 5 | 0 |
| Descripteurs seuls | 0.60 | 0.60 | 0.66 | 0 | 0 |
| Embeddings seuls | 0.60 | 0.80 | 0.89 | 0 | 0 |
| Hybride | 0.60 | 0.60 | 0.64 | 0 | 0 |
| Hybride + MMR | 0.60 | 0.70 | 0.72 | 0 | 0 |

Pertinents manqués par l'hybride : Outer Wilds, The Solus Project.

## Resident Evil 4

| # | Ancienne règle (prod) | Descripteurs seuls | Embeddings seuls | Hybride | Hybride + MMR |
|---|---|---|---|---|---|
| 1 | Resistance 3 (1) | Resident Evil: Revelations 2 (3) | Resident Evil 5 (3) | Resident Evil: Revelations 2 (3) | Resident Evil: Revelations 2 (3) |
| 2 | Return to Castle Wolfenstein (0) | Dead Space 2 (3) | Devil May Cry (1) | Dead Space 2 (3) | Dead Space 2 (3) |
| 3 | Rez (0) | Days Gone (1) | Daymare: 1998 (2) | The Evil Within (3) | The Evil Within (3) |
| 4 | Rhythm Thief & the Emperor's Treasure (0) | The Evil Within (3) | Tormented Souls (2) | Days Gone (1) | Days Gone (1) |
| 5 | Rock Band 3 (0) | The Callisto Protocol (3) | The Evil Within (3) | Daymare: 1998 (2) | Daymare: 1998 (2) |
| 6 | Rune Factory Frontier (0) | Daymare: 1998 (2) | Dead Space 2 (3) | The Callisto Protocol (3) | Quantum Break (1) |
| 7 | S.T.A.L.K.E.R.: Shadow of Chernobyl (1) | World War Z (2019) (1) | Dead Island 2 (1) | Resident Evil Zero: HD Remaster (2) | Control (1) |
| 8 | Sam & Max 101: Culture Shock (0) | Quantum Break (1) | Left 4 Dead 2 (1) | World War Z (2019) (1) | Half-Life 2 (1) |
| 9 | Sam & Max 102: Situation: Comedy (0) | Resident Evil Zero: HD Remaster (2) | Blood and Bacon (0) | The Evil Within 2 (3) | Tomb Raider: The Angel of Darkness (0) |
| 10 | Sam & Max 103: The Mole, the Mob, and the Meatball (0) | The Evil Within 2 (3) | Propagation VR (0) | Propagation VR (0) | The Last of Us (2) |

Jeux pertinents connus pour ce jeu : 12.

| Variante | P@5 | P@10 | nDCG@10 | Hors sujet top 5 | Non notés top 10 |
|---|---|---|---|---|---|
| Ancienne règle (prod) | 0.00 | 0.00 | 0.05 | 4 | 0 |
| Descripteurs seuls | 0.80 | 0.70 | 0.83 | 0 | 0 |
| Embeddings seuls | 0.80 | 0.50 | 0.61 | 0 | 0 |
| Hybride | 0.80 | 0.70 | 0.84 | 0 | 0 |
| Hybride + MMR | 0.80 | 0.50 | 0.68 | 0 | 0 |

Pertinents manqués par l'hybride : Resident Evil 2 (1998), Resident Evil 3: Nemesis.

## Forza Horizon 4

| # | Ancienne règle (prod) | Descripteurs seuls | Embeddings seuls | Hybride | Hybride + MMR |
|---|---|---|---|---|---|
| 1 | FlatOut 2 (1) | Need For Speed Heat (3) | The Crew (3) | Need For Speed Heat (3) | Need For Speed Heat (3) |
| 2 | Horizon Chase Turbo (1) | Street Racing Syndicate (1) | Assetto Corsa (1) | The Crew (3) | Need for Speed II (1) |
| 3 | Forza Horizon 3 (3) | Assetto Corsa (1) | Project CARS (1) | Assetto Corsa (1) | Gran Turismo 7 (2) |
| 4 | Crash Team Racing Nitro-Fueled (0) | F1 2016 (1) | Forza Motorsport (2023) (2) | Street Racing Syndicate (1) | SnowRunner (0) |
| 5 | Fortix (0) | Project Cars 2 (1) | Grid Autosport (1) | SnowRunner (0) | Assetto Corsa (1) |
| 6 | Super Mario Kart (0) | WRC 7: World Rally Championship (1) | SnowRunner (0) | The Crew 2 (3) | The Crew (3) |
| 7 | Burnout Paradise (2) | Dirt Rally (1) | The Crew 2 (3) | Dirt Rally (1) | WRC 7: World Rally Championship (1) |
| 8 | Need for Speed: Underground (2) | SnowRunner (0) | Need for Speed: Carbon (2) | Project Cars 2 (1) | The Crew 2 (3) |
| 9 | Burnout 3: Takedown (1) | The Crew (3) | My Summer Car (0) | Dirt Rally 2.0 (1) | Dirt 3 (1) |
| 10 | Sleeping Dogs: Definitive Edition (0) | The Crew 2 (3) | Dirt Rally 2.0 (1) | WRC 7: World Rally Championship (1) | Forza Horizon 5 (3) |

Jeux pertinents connus pour ce jeu : 10.

| Variante | P@5 | P@10 | nDCG@10 | Hors sujet top 5 | Non notés top 10 |
|---|---|---|---|---|---|
| Ancienne règle (prod) | 0.20 | 0.30 | 0.29 | 2 | 0 |
| Descripteurs seuls | 0.20 | 0.30 | 0.54 | 0 | 0 |
| Embeddings seuls | 0.40 | 0.40 | 0.53 | 0 | 0 |
| Hybride | 0.40 | 0.30 | 0.63 | 1 | 0 |
| Hybride + MMR | 0.40 | 0.50 | 0.66 | 1 | 0 |

Pertinents manqués par l'hybride : Burnout Paradise, Forza Horizon 3, Need for Speed: Underground.

## It Takes Two

| # | Ancienne règle (prod) | Descripteurs seuls | Embeddings seuls | Hybride | Hybride + MMR |
|---|---|---|---|---|---|
| 1 | Crash Bandicoot 4: It's About Time (1) | The Spirit and The Mouse (0) | Hamilton's Great Adventure (1) | The Spirit and The Mouse (0) | The Spirit and The Mouse (0) |
| 2 | ATRI - My Dear Moments (0) | Trine 3: The Artifacts of Power (2) | Degrees of Separation (2) | Trine 3: The Artifacts of Power (2) | Split Fiction (3) |
| 3 | Into the Radius VR (0) | Bokura (2) | Shift Happens (2) | Bokura (2) | Trine 3: The Artifacts of Power (2) |
| 4 | Rogue Legacy 2 (0) | Split Fiction (3) | Bokura (2) | Split Fiction (3) | A Way Out (3) |
| 5 | Carto (0) | A Way Out (3) | Toodee and Topdee (1) | KeyWe (1) | Bokura (2) |
| 6 | Bomb Rush Cyberfunk (0) | Phogs! (2) | Arise: A Simple Story (1) | Planet of Lana (1) | KeyWe (1) |
| 7 | Pikmin 3 Deluxe (0) | A Boy and His Blob (1) | Planet of Lana (1) | Phogs! (2) | Planet of Lana (1) |
| 8 | There Is No Game: Wrong Dimension (0) | KeyWe (1) | Split Fiction (3) | Trine 2 (2) | Hamilton's Great Adventure (1) |
| 9 | Library Of Ruina (0) | Planet of Lana (1) | Bloody Trapland (1) | Arise: A Simple Story (1) | Ibb and Obb (2) |
| 10 | The Henry Stickmin Collection (0) | Minute of Islands (0) | Ibb and Obb (2) | Balan Wonderworld (0) | Arise: A Simple Story (1) |

Jeux pertinents connus pour ce jeu : 10.

| Variante | P@5 | P@10 | nDCG@10 | Hors sujet top 5 | Non notés top 10 |
|---|---|---|---|---|---|
| Ancienne règle (prod) | 0.00 | 0.00 | 0.05 | 4 | 0 |
| Descripteurs seuls | 0.80 | 0.50 | 0.50 | 1 | 0 |
| Embeddings seuls | 0.60 | 0.50 | 0.46 | 0 | 0 |
| Hybride | 0.60 | 0.50 | 0.42 | 1 | 0 |
| Hybride + MMR | 0.80 | 0.50 | 0.55 | 1 | 0 |

Pertinents manqués par l'hybride : Unravel 2.
