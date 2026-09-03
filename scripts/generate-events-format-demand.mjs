#!/usr/bin/env node

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  DEFAULT_API_VERSION,
  DEFAULT_GEO_TARGET_IDS,
  DEFAULT_LANGUAGE_ID,
  fetchKeywordHistoricalMetrics,
  loadGoogleAdsEnvironment,
  metricsRows,
  requireEnvironment,
} from "./lib/google-ads.mjs";

const OBSERVED_AT = "2026-09-03";
const PUBLIC_DIRECTORY = join(
  process.cwd(),
  "publications/events-economy-2026/evidence",
);
const PRIVATE_DIRECTORY = join(
  process.cwd(),
  "private-data/events-economy-2026",
);

const archetypes = {
  social_first: [4, 4, 5, 5, 4, 3],
  spectator_culture: [5, 2, 1, 1, 4, 2],
  hosted_content: [4, 3, 3, 5, 4, 4],
  participatory_performance: [4, 4, 5, 4, 4, 4],
  social_dance: [5, 5, 5, 4, 4, 4],
  studio_craft: [5, 4, 4, 2, 5, 4],
  portable_craft: [4, 3, 4, 4, 4, 4],
  food_class: [5, 3, 4, 3, 5, 3],
  tasting: [5, 3, 4, 5, 5, 3],
  tabletop: [4, 5, 5, 5, 4, 4],
  venue_entertainment: [5, 3, 4, 2, 5, 3],
  team_sport: [4, 5, 5, 2, 4, 4],
  facility_sport: [5, 4, 4, 2, 4, 3],
  outdoor_club: [3, 5, 5, 4, 3, 4],
  fitness_class: [5, 5, 2, 4, 4, 1],
  retreat: [5, 3, 4, 3, 5, 4],
  spa_asset: [5, 2, 2, 1, 5, 1],
  nature_class: [4, 3, 4, 4, 4, 4],
  hobby_club: [3, 5, 5, 5, 3, 4],
  technical_workshop: [4, 3, 4, 3, 5, 4],
  community_format: [2, 5, 5, 5, 2, 3],
};

const entryModels = {
  social_first: "owned hosted series in a partner venue",
  spectator_culture:
    "niche programme or curation; do not begin with full production",
  hosted_content: "touring programme in partner venues",
  participatory_performance: "short course or recurring hosted night",
  social_dance: "recurring beginner-friendly dance night in a partner venue",
  studio_craft:
    "portable workshop or studio-capacity partnership before a lease",
  portable_craft: "venue-partnered workshop series",
  food_class: "licensed kitchen or hospitality partnership",
  tasting:
    "producer and venue partnership while the operator owns the audience",
  tabletop: "recurring hosted night, ladder or league in a hospitality venue",
  venue_entertainment:
    "partner with the asset owner; do not build the venue first",
  team_sport: "prepaid season using rented facility slots",
  facility_sport: "managed social session through an existing facility",
  outdoor_club: "host-led club or bounded paid cohort",
  fitness_class: "themed social cohort through an instructor and venue partner",
  retreat: "hosted weekend using partner accommodation and practitioners",
  spa_asset: "package existing spa inventory; do not build the asset",
  nature_class: "guided session with a qualified facilitator and land partner",
  hobby_club: "recurring club or season with a facilitator",
  technical_workshop: "short course in a maker or education venue",
  community_format:
    "sponsor or venue-funded community layer rather than ticket-first",
};

function format(
  family,
  name,
  archetype,
  primary,
  support = [],
  overrides = {},
) {
  return { family, name, archetype, primary, support, overrides };
}

const formats = [
  format(
    "Social and relationship",
    "General social events",
    "social_first",
    "social events near me",
    ["social events"],
  ),
  format(
    "Social and relationship",
    "Singles events",
    "social_first",
    "singles events near me",
    ["singles events"],
  ),
  format(
    "Social and relationship",
    "Speed dating",
    "social_first",
    "speed dating near me",
    ["speed dating"],
  ),
  format(
    "Social and relationship",
    "Dinner with strangers",
    "social_first",
    "dinner with strangers",
    ["dinner with strangers near me"],
  ),
  format(
    "Social and relationship",
    "Supper clubs",
    "social_first",
    "supper club near me",
    ["supper club"],
    { commercialIntent: 5, socialDesign: 4 },
  ),
  format(
    "Social and relationship",
    "Friendship events",
    "social_first",
    "friendship events near me",
    ["friendship events"],
  ),
  format(
    "Social and relationship",
    "Social clubs",
    "hobby_club",
    "social clubs near me",
    ["social club near me"],
    { commercialIntent: 2, differentiation: 3 },
  ),
  format(
    "Social and relationship",
    "Language exchange",
    "hobby_club",
    "language exchange near me",
    ["language exchange events"],
  ),
  format(
    "Social and relationship",
    "Expat events",
    "social_first",
    "expat events near me",
    ["expat events"],
  ),
  format(
    "Social and relationship",
    "Sober socials",
    "social_first",
    "sober social events",
    ["sober events near me"],
    { differentiation: 5 },
  ),
  format("Live culture", "Theatre", "spectator_culture", "theatre near me", [
    "theatre tickets near me",
  ]),
  format(
    "Live culture",
    "Immersive theatre",
    "participatory_performance",
    "immersive theatre near me",
    ["immersive theatre"],
  ),
  format(
    "Live culture",
    "Stand-up comedy",
    "spectator_culture",
    "stand up comedy near me",
    ["comedy club near me"],
    { socialDesign: 2, operatingEase: 3 },
  ),
  format(
    "Live culture",
    "Live music",
    "spectator_culture",
    "live music near me",
    ["live music events near me"],
  ),
  format(
    "Live culture",
    "Jazz clubs",
    "spectator_culture",
    "jazz club near me",
    ["live jazz near me"],
  ),
  format(
    "Live culture",
    "Classical concerts",
    "spectator_culture",
    "classical concerts near me",
    ["classical music near me"],
  ),
  format("Live culture", "Opera", "spectator_culture", "opera near me", [
    "opera tickets",
  ]),
  format("Live culture", "Ballet", "spectator_culture", "ballet near me", [
    "ballet tickets",
  ]),
  format("Live culture", "Cabaret", "spectator_culture", "cabaret near me", [
    "cabaret shows near me",
  ]),
  format(
    "Live culture",
    "Drag shows",
    "spectator_culture",
    "drag show near me",
    ["drag events near me"],
    { socialDesign: 3, operatingEase: 3 },
  ),
  format(
    "Live culture",
    "Spoken word",
    "hosted_content",
    "spoken word events near me",
    ["spoken word night"],
  ),
  format(
    "Live culture",
    "Poetry nights",
    "hosted_content",
    "poetry night near me",
    ["poetry events near me"],
  ),
  format(
    "Live culture",
    "Storytelling nights",
    "hosted_content",
    "storytelling events near me",
    ["storytelling night"],
  ),
  format(
    "Live culture",
    "Open-mic nights",
    "participatory_performance",
    "open mic night near me",
    ["open mic near me"],
  ),
  format(
    "Live culture",
    "Outdoor cinema",
    "spectator_culture",
    "outdoor cinema near me",
    ["open air cinema near me"],
    { operatingEase: 2, differentiation: 4 },
  ),
  format("Live culture", "Film clubs", "hobby_club", "film club near me", [
    "cinema club near me",
  ]),
  format(
    "Performance and dance",
    "Acting classes",
    "participatory_performance",
    "acting classes near me",
    ["adult acting classes near me"],
  ),
  format(
    "Performance and dance",
    "Improv classes",
    "participatory_performance",
    "improv classes near me",
    ["improv workshop near me"],
    { socialDesign: 5 },
  ),
  format(
    "Performance and dance",
    "Comedy classes",
    "participatory_performance",
    "comedy classes near me",
    ["stand up comedy course"],
  ),
  format("Performance and dance", "Choirs", "hobby_club", "choir near me", [
    "choirs near me",
  ]),
  format(
    "Performance and dance",
    "Singing groups",
    "hobby_club",
    "singing groups near me",
    ["singing group near me"],
  ),
  format(
    "Performance and dance",
    "Karaoke",
    "participatory_performance",
    "karaoke near me",
    ["karaoke events near me"],
    { repeatability: 3 },
  ),
  format(
    "Performance and dance",
    "Salsa classes",
    "social_dance",
    "salsa classes near me",
    ["salsa dancing near me"],
    { socialDesign: 5 },
  ),
  format(
    "Performance and dance",
    "Bachata classes",
    "social_dance",
    "bachata classes near me",
    ["bachata near me"],
    { socialDesign: 5 },
  ),
  format(
    "Performance and dance",
    "Ballroom dancing",
    "social_dance",
    "ballroom dancing near me",
    ["ballroom dance classes near me"],
    { socialDesign: 5 },
  ),
  format(
    "Performance and dance",
    "Swing dancing",
    "social_dance",
    "swing dance classes near me",
    ["swing dancing near me"],
    { socialDesign: 5 },
  ),
  format(
    "Performance and dance",
    "Line dancing",
    "social_dance",
    "line dancing near me",
    ["line dancing classes near me"],
    { socialDesign: 5 },
  ),
  format(
    "Performance and dance",
    "Contemporary dance",
    "fitness_class",
    "contemporary dance classes near me",
    ["adult contemporary dance near me"],
  ),
  format(
    "Performance and dance",
    "Street dance",
    "fitness_class",
    "adult street dance classes near me",
    ["street dance classes near me"],
  ),
  format(
    "Performance and dance",
    "Pole dancing",
    "fitness_class",
    "pole dancing classes near me",
    ["pole fitness near me"],
  ),
  format(
    "Performance and dance",
    "Burlesque classes",
    "participatory_performance",
    "burlesque classes near me",
    ["burlesque workshop"],
  ),
  format(
    "Performance and dance",
    "Circus skills",
    "participatory_performance",
    "circus skills classes near me",
    ["circus workshop near me"],
  ),
  format(
    "Performance and dance",
    "Drumming circles",
    "participatory_performance",
    "drumming circle near me",
    ["drumming workshop near me"],
  ),
  format(
    "Performance and dance",
    "Music jam sessions",
    "hobby_club",
    "jam sessions near me",
    ["music jam near me"],
  ),
  format(
    "Performance and dance",
    "DJ workshops",
    "technical_workshop",
    "dj workshops near me",
    ["dj course near me"],
  ),
  format(
    "Ideas, books and learning",
    "Public lectures",
    "hosted_content",
    "public lectures near me",
    ["public lectures"],
  ),
  format(
    "Ideas, books and learning",
    "Live talks",
    "hosted_content",
    "live talks near me",
    ["talks near me"],
  ),
  format(
    "Ideas, books and learning",
    "Book clubs",
    "hobby_club",
    "book club near me",
    ["book clubs near me"],
    { commercialIntent: 2, revenueDepth: 2 },
  ),
  format(
    "Ideas, books and learning",
    "Reading groups",
    "hobby_club",
    "reading groups near me",
    ["reading group near me"],
    { commercialIntent: 2, revenueDepth: 2 },
  ),
  format(
    "Ideas, books and learning",
    "Creative-writing classes",
    "technical_workshop",
    "creative writing classes near me",
    ["creative writing workshops near me"],
  ),
  format(
    "Ideas, books and learning",
    "Poetry workshops",
    "technical_workshop",
    "poetry workshops near me",
    ["poetry class near me"],
  ),
  format(
    "Ideas, books and learning",
    "Philosophy groups",
    "hobby_club",
    "philosophy groups near me",
    ["philosophy club near me"],
  ),
  format(
    "Ideas, books and learning",
    "Debate clubs",
    "hobby_club",
    "debate club near me",
    ["debating society near me"],
  ),
  format(
    "Ideas, books and learning",
    "History talks",
    "hosted_content",
    "history talks near me",
    ["local history talks"],
  ),
  format(
    "Ideas, books and learning",
    "Science talks",
    "hosted_content",
    "science talks near me",
    ["science events near me"],
  ),
  format(
    "Ideas, books and learning",
    "Astronomy clubs",
    "hobby_club",
    "astronomy club near me",
    ["astronomy groups near me"],
  ),
  format(
    "Ideas, books and learning",
    "Stargazing events",
    "nature_class",
    "stargazing events near me",
    ["stargazing near me"],
  ),
  format(
    "Ideas, books and learning",
    "Museum events",
    "hosted_content",
    "museum events near me",
    ["museum late events"],
    { operatingEase: 3 },
  ),
  format(
    "Ideas, books and learning",
    "Gallery events",
    "hosted_content",
    "art gallery events near me",
    ["gallery talks near me"],
    { operatingEase: 3 },
  ),
  format(
    "Ideas, books and learning",
    "Guided walking tours",
    "hosted_content",
    "walking tours near me",
    ["guided walks near me"],
  ),
  format(
    "Craft and making",
    "Pottery classes",
    "studio_craft",
    "pottery classes near me",
    ["pottery workshop near me"],
  ),
  format(
    "Craft and making",
    "Pottery painting",
    "studio_craft",
    "pottery painting near me",
    ["pottery painting"],
  ),
  format(
    "Craft and making",
    "Sip and paint",
    "portable_craft",
    "sip and paint near me",
    ["sip and paint"],
  ),
  format(
    "Craft and making",
    "Painting classes",
    "portable_craft",
    "painting classes near me",
    ["painting workshop near me"],
  ),
  format(
    "Craft and making",
    "General art workshops",
    "portable_craft",
    "art workshops near me",
    ["adult art workshops near me"],
  ),
  format(
    "Craft and making",
    "Life drawing",
    "portable_craft",
    "life drawing near me",
    ["life drawing classes near me"],
  ),
  format(
    "Craft and making",
    "Drawing classes",
    "portable_craft",
    "drawing classes near me",
    ["adult drawing classes near me"],
  ),
  format(
    "Craft and making",
    "Watercolour classes",
    "portable_craft",
    "watercolour classes near me",
    ["watercolour workshop near me"],
  ),
  format(
    "Craft and making",
    "Printmaking",
    "studio_craft",
    "printmaking workshops near me",
    ["printmaking classes near me"],
  ),
  format(
    "Craft and making",
    "Lino printing",
    "portable_craft",
    "lino printing workshop near me",
    ["lino printing course near me"],
  ),
  format(
    "Craft and making",
    "Screen printing",
    "studio_craft",
    "screen printing workshop near me",
    ["screen printing course near me"],
  ),
  format(
    "Craft and making",
    "Jewellery making",
    "studio_craft",
    "jewellery making classes near me",
    ["jewellery making workshop near me"],
  ),
  format(
    "Craft and making",
    "Silversmithing",
    "studio_craft",
    "silversmithing courses near me",
    ["silversmithing workshop near me"],
  ),
  format(
    "Craft and making",
    "Candle making",
    "portable_craft",
    "candle making workshop near me",
    ["candle making class near me"],
  ),
  format(
    "Craft and making",
    "Soap making",
    "portable_craft",
    "soap making courses near me",
    ["soap making workshop near me"],
  ),
  format(
    "Craft and making",
    "Perfume making",
    "portable_craft",
    "perfume making workshop near me",
    ["perfume making experience"],
  ),
  format(
    "Craft and making",
    "Floristry",
    "studio_craft",
    "floristry courses near me",
    ["floristry workshops near me"],
  ),
  format(
    "Craft and making",
    "Wreath making",
    "portable_craft",
    "wreath making workshop near me",
    ["wreath making near me"],
    { repeatability: 2 },
  ),
  format(
    "Craft and making",
    "Knitting groups",
    "hobby_club",
    "knitting groups near me",
    ["knitting club near me"],
  ),
  format(
    "Craft and making",
    "Crochet groups",
    "hobby_club",
    "crochet groups near me",
    ["crochet club near me"],
  ),
  format(
    "Craft and making",
    "Sewing classes",
    "studio_craft",
    "sewing classes near me",
    ["sewing workshop near me"],
  ),
  format(
    "Craft and making",
    "Embroidery workshops",
    "portable_craft",
    "embroidery workshops near me",
    ["embroidery classes near me"],
  ),
  format(
    "Craft and making",
    "Quilting groups",
    "hobby_club",
    "quilting groups near me",
    ["quilting club near me"],
  ),
  format(
    "Craft and making",
    "Woodworking",
    "studio_craft",
    "woodworking courses near me",
    ["woodworking classes near me"],
  ),
  format(
    "Craft and making",
    "Woodturning",
    "studio_craft",
    "woodturning courses near me",
    ["woodturning classes near me"],
  ),
  format(
    "Craft and making",
    "Leatherworking",
    "studio_craft",
    "leather workshop near me",
    ["leather craft course near me"],
  ),
  format(
    "Craft and making",
    "Glassblowing",
    "studio_craft",
    "glass blowing near me",
    ["glass blowing experience"],
  ),
  format(
    "Craft and making",
    "Stained glass",
    "studio_craft",
    "stained glass courses near me",
    ["stained glass workshop near me"],
  ),
  format(
    "Craft and making",
    "Mosaic making",
    "portable_craft",
    "mosaic workshops near me",
    ["mosaic classes near me"],
  ),
  format(
    "Craft and making",
    "Sculpture",
    "studio_craft",
    "sculpture classes near me",
    ["sculpture workshop near me"],
  ),
  format(
    "Craft and making",
    "Calligraphy",
    "portable_craft",
    "calligraphy classes near me",
    ["calligraphy workshop near me"],
  ),
  format(
    "Craft and making",
    "Bookbinding",
    "portable_craft",
    "bookbinding courses near me",
    ["bookbinding workshop near me"],
  ),
  format(
    "Craft and making",
    "Basket weaving",
    "portable_craft",
    "basket weaving courses near me",
    ["basket weaving workshop near me"],
  ),
  format(
    "Craft and making",
    "Tufting",
    "studio_craft",
    "tufting workshop near me",
    ["rug tufting near me"],
  ),
  format(
    "Craft and making",
    "Resin art",
    "portable_craft",
    "resin art classes near me",
    ["resin workshop near me"],
  ),
  format(
    "Craft and making",
    "Terrarium making",
    "portable_craft",
    "terrarium workshop near me",
    ["terrarium making near me"],
  ),
  format(
    "Craft and making",
    "Upcycling",
    "technical_workshop",
    "upcycling workshops near me",
    ["upcycling classes near me"],
  ),
  format(
    "Craft and making",
    "Furniture restoration",
    "studio_craft",
    "furniture restoration courses near me",
    ["furniture restoration workshop near me"],
  ),
  format(
    "Craft and making",
    "Photography workshops",
    "technical_workshop",
    "photography workshops near me",
    ["photography classes near me"],
  ),
  format(
    "Food and drink",
    "Cooking classes",
    "food_class",
    "cooking classes near me",
    ["cookery courses near me"],
  ),
  format(
    "Food and drink",
    "Baking classes",
    "food_class",
    "baking classes near me",
    ["baking courses near me"],
  ),
  format(
    "Food and drink",
    "Bread making",
    "food_class",
    "bread making course near me",
    ["bread making class near me"],
  ),
  format(
    "Food and drink",
    "Pasta making",
    "food_class",
    "pasta making class near me",
    ["pasta workshop near me"],
  ),
  format(
    "Food and drink",
    "Sushi making",
    "food_class",
    "sushi making class near me",
    ["sushi workshop near me"],
  ),
  format(
    "Food and drink",
    "Chocolate making",
    "food_class",
    "chocolate making workshop near me",
    ["chocolate making experience"],
  ),
  format(
    "Food and drink",
    "Cake decorating",
    "food_class",
    "cake decorating classes near me",
    ["cake decorating course near me"],
  ),
  format(
    "Food and drink",
    "Cheese making",
    "food_class",
    "cheese making courses near me",
    ["cheese making experience"],
  ),
  format(
    "Food and drink",
    "Fermentation",
    "food_class",
    "fermentation courses near me",
    ["fermentation workshop near me"],
  ),
  format(
    "Food and drink",
    "Vegan cooking",
    "food_class",
    "vegan cooking classes near me",
    ["vegan cookery course"],
  ),
  format("Food and drink", "Wine tasting", "tasting", "wine tasting near me", [
    "wine tasting events near me",
  ]),
  format(
    "Food and drink",
    "Cocktail masterclasses",
    "tasting",
    "cocktail making class near me",
    ["cocktail masterclass near me"],
  ),
  format("Food and drink", "Gin tasting", "tasting", "gin tasting near me", [
    "gin tasting experience",
  ]),
  format(
    "Food and drink",
    "Whisky tasting",
    "tasting",
    "whisky tasting near me",
    ["whiskey tasting near me"],
  ),
  format("Food and drink", "Beer tasting", "tasting", "beer tasting near me", [
    "beer tasting experience",
  ]),
  format(
    "Food and drink",
    "Coffee workshops",
    "tasting",
    "coffee workshop near me",
    ["barista course near me"],
  ),
  format("Food and drink", "Tea tasting", "tasting", "tea tasting near me", [
    "tea tasting experience",
  ]),
  format(
    "Food and drink",
    "Food tours",
    "hosted_content",
    "food tours near me",
    ["food walking tour near me"],
    { commercialIntent: 5, repeatability: 2 },
  ),
  format(
    "Tabletop and games",
    "Board-game cafes",
    "tabletop",
    "board game cafe near me",
    ["board game cafe"],
    {
      commercialIntent: 5,
      repeatability: 4,
      operatingEase: 3,
      revenueDepth: 5,
    },
  ),
  format(
    "Tabletop and games",
    "Board-game nights",
    "tabletop",
    "board game night near me",
    ["board game events near me"],
  ),
  format(
    "Tabletop and games",
    "Chess clubs",
    "tabletop",
    "chess club near me",
    ["chess clubs near me"],
    { commercialIntent: 3, revenueDepth: 3 },
  ),
  format(
    "Tabletop and games",
    "Dungeons & Dragons",
    "tabletop",
    "dungeons and dragons near me",
    ["dnd groups near me"],
    { operatingEase: 3, revenueDepth: 5 },
  ),
  format(
    "Tabletop and games",
    "Tabletop role-playing",
    "tabletop",
    "tabletop rpg near me",
    ["tabletop roleplaying groups near me"],
    { operatingEase: 3, revenueDepth: 5 },
  ),
  format("Tabletop and games", "Mahjong", "tabletop", "mahjong near me", [
    "mahjong club near me",
  ]),
  format(
    "Tabletop and games",
    "Poker nights",
    "tabletop",
    "poker nights near me",
    ["poker club near me"],
    { operatingEase: 3 },
  ),
  format(
    "Tabletop and games",
    "Bridge clubs",
    "tabletop",
    "bridge club near me",
    ["bridge clubs near me"],
    { commercialIntent: 2, revenueDepth: 2, differentiation: 3 },
  ),
  format(
    "Tabletop and games",
    "Backgammon clubs",
    "tabletop",
    "backgammon club near me",
    ["backgammon near me"],
  ),
  format(
    "Tabletop and games",
    "Quiz nights",
    "tabletop",
    "quiz night near me",
    ["pub quiz near me"],
    { commercialIntent: 3, repeatability: 5, socialDesign: 5, revenueDepth: 3 },
  ),
  format(
    "Tabletop and games",
    "Bingo",
    "venue_entertainment",
    "bingo near me",
    ["bingo night near me"],
    { repeatability: 4 },
  ),
  format(
    "Tabletop and games",
    "Murder-mystery dinners",
    "venue_entertainment",
    "murder mystery dinner near me",
    ["murder mystery events near me"],
    { socialDesign: 5, differentiation: 4 },
  ),
  format(
    "Tabletop and games",
    "Escape rooms",
    "venue_entertainment",
    "escape rooms near me",
    ["escape room near me"],
  ),
  format(
    "Tabletop and games",
    "Gaming tournaments",
    "venue_entertainment",
    "gaming tournaments near me",
    ["video game tournaments near me"],
    { repeatability: 4 },
  ),
  format(
    "Tabletop and games",
    "Esports events",
    "venue_entertainment",
    "esports events near me",
    ["esports tournaments near me"],
  ),
  format(
    "Tabletop and games",
    "Video-game bars",
    "venue_entertainment",
    "gaming bar near me",
    ["video game bar near me"],
  ),
  format(
    "Competitive experiences",
    "Axe throwing",
    "venue_entertainment",
    "axe throwing near me",
    ["axe throwing"],
  ),
  format(
    "Competitive experiences",
    "Bowling",
    "venue_entertainment",
    "bowling near me",
    ["bowling alley near me"],
  ),
  format(
    "Competitive experiences",
    "Darts",
    "tabletop",
    "darts near me",
    ["darts club near me"],
    { commercialIntent: 5, operatingEase: 4, revenueDepth: 5 },
  ),
  format(
    "Competitive experiences",
    "Shuffleboard",
    "venue_entertainment",
    "shuffleboard near me",
    ["shuffleboard bar near me"],
  ),
  format(
    "Competitive experiences",
    "Crazy golf",
    "venue_entertainment",
    "crazy golf near me",
    ["mini golf near me"],
  ),
  format(
    "Competitive experiences",
    "Laser tag",
    "venue_entertainment",
    "laser tag near me",
    ["laser quest near me"],
  ),
  format(
    "Competitive experiences",
    "Paintball",
    "venue_entertainment",
    "paintball near me",
    ["paintballing near me"],
  ),
  format(
    "Competitive experiences",
    "Airsoft",
    "venue_entertainment",
    "airsoft near me",
    ["airsoft events near me"],
  ),
  format(
    "Competitive experiences",
    "Go-karting",
    "venue_entertainment",
    "go karting near me",
    ["go karts near me"],
  ),
  format("Racket and team sport", "Padel", "facility_sport", "padel near me", [
    "padel clubs near me",
  ]),
  format(
    "Racket and team sport",
    "Pickleball",
    "facility_sport",
    "pickleball near me",
    ["pickleball clubs near me"],
  ),
  format(
    "Racket and team sport",
    "Tennis",
    "facility_sport",
    "tennis clubs near me",
    ["tennis lessons near me"],
  ),
  format(
    "Racket and team sport",
    "Badminton",
    "facility_sport",
    "badminton clubs near me",
    ["badminton near me"],
  ),
  format(
    "Racket and team sport",
    "Squash",
    "facility_sport",
    "squash clubs near me",
    ["squash courts near me"],
  ),
  format(
    "Racket and team sport",
    "Table tennis",
    "facility_sport",
    "table tennis clubs near me",
    ["table tennis near me"],
  ),
  format(
    "Racket and team sport",
    "Five-a-side football",
    "team_sport",
    "5 a side football near me",
    ["five a side football near me"],
  ),
  format(
    "Racket and team sport",
    "Social football",
    "team_sport",
    "social football near me",
    ["football groups near me"],
  ),
  format(
    "Racket and team sport",
    "Netball",
    "team_sport",
    "netball clubs near me",
    ["social netball near me"],
  ),
  format(
    "Racket and team sport",
    "Basketball",
    "team_sport",
    "basketball clubs near me",
    ["basketball near me"],
  ),
  format(
    "Racket and team sport",
    "Volleyball",
    "team_sport",
    "volleyball clubs near me",
    ["social volleyball near me"],
  ),
  format(
    "Racket and team sport",
    "Dodgeball",
    "team_sport",
    "dodgeball near me",
    ["dodgeball clubs near me"],
  ),
  format(
    "Racket and team sport",
    "Rounders",
    "team_sport",
    "rounders clubs near me",
    ["social rounders near me"],
  ),
  format(
    "Racket and team sport",
    "Softball",
    "team_sport",
    "softball clubs near me",
    ["softball near me"],
  ),
  format(
    "Racket and team sport",
    "Touch rugby",
    "team_sport",
    "touch rugby near me",
    ["social rugby near me"],
  ),
  format(
    "Racket and team sport",
    "Cricket",
    "team_sport",
    "cricket clubs near me",
    ["social cricket near me"],
    { socialDesign: 4, operatingEase: 1, differentiation: 3 },
  ),
  format(
    "Racket and team sport",
    "Hockey",
    "team_sport",
    "hockey clubs near me",
    ["social hockey near me"],
  ),
  format(
    "Racket and team sport",
    "Korfball",
    "team_sport",
    "korfball near me",
    ["korfball clubs near me"],
  ),
  format(
    "Outdoor and endurance",
    "Running clubs",
    "outdoor_club",
    "running clubs near me",
    ["run club near me"],
  ),
  format(
    "Outdoor and endurance",
    "Walking groups",
    "outdoor_club",
    "walking groups near me",
    ["walking club near me"],
  ),
  format(
    "Outdoor and endurance",
    "Hiking groups",
    "outdoor_club",
    "hiking groups near me",
    ["hiking club near me"],
  ),
  format(
    "Outdoor and endurance",
    "Cycling clubs",
    "outdoor_club",
    "cycling clubs near me",
    ["bike clubs near me"],
  ),
  format(
    "Outdoor and endurance",
    "Swimming clubs",
    "facility_sport",
    "swimming clubs near me",
    ["adult swimming club near me"],
  ),
  format(
    "Outdoor and endurance",
    "Open-water swimming",
    "outdoor_club",
    "open water swimming near me",
    ["wild swimming groups near me"],
    { operatingEase: 1 },
  ),
  format(
    "Outdoor and endurance",
    "Triathlon clubs",
    "outdoor_club",
    "triathlon clubs near me",
    ["triathlon club near me"],
  ),
  format(
    "Outdoor and endurance",
    "Climbing",
    "facility_sport",
    "climbing near me",
    ["climbing clubs near me"],
  ),
  format(
    "Outdoor and endurance",
    "Bouldering",
    "facility_sport",
    "bouldering near me",
    ["bouldering clubs near me"],
  ),
  format(
    "Outdoor and endurance",
    "Rowing clubs",
    "facility_sport",
    "rowing clubs near me",
    ["rowing club near me"],
  ),
  format(
    "Outdoor and endurance",
    "Kayaking",
    "facility_sport",
    "kayaking near me",
    ["kayak clubs near me"],
  ),
  format(
    "Outdoor and endurance",
    "Canoeing",
    "facility_sport",
    "canoeing near me",
    ["canoe clubs near me"],
  ),
  format(
    "Outdoor and endurance",
    "Paddleboarding",
    "facility_sport",
    "paddleboarding near me",
    ["paddle board near me"],
  ),
  format(
    "Outdoor and endurance",
    "Sailing clubs",
    "facility_sport",
    "sailing clubs near me",
    ["sailing club near me"],
  ),
  format(
    "Outdoor and endurance",
    "Surfing",
    "facility_sport",
    "surfing near me",
    ["surf clubs near me"],
  ),
  format(
    "Outdoor and endurance",
    "Disc golf",
    "facility_sport",
    "disc golf near me",
    ["disc golf clubs near me"],
  ),
  format(
    "Outdoor and endurance",
    "Roller skating",
    "facility_sport",
    "roller skating near me",
    ["roller disco near me"],
  ),
  format(
    "Fitness and mind-body",
    "Yoga classes",
    "fitness_class",
    "yoga classes near me",
    ["yoga near me"],
  ),
  format(
    "Fitness and mind-body",
    "Pilates classes",
    "fitness_class",
    "pilates classes near me",
    ["pilates near me"],
  ),
  format(
    "Fitness and mind-body",
    "Barre classes",
    "fitness_class",
    "barre classes near me",
    ["barre fitness near me"],
  ),
  format(
    "Fitness and mind-body",
    "Bootcamps",
    "fitness_class",
    "bootcamp near me",
    ["fitness bootcamp near me"],
  ),
  format(
    "Fitness and mind-body",
    "Calisthenics",
    "fitness_class",
    "calisthenics classes near me",
    ["calisthenics near me"],
  ),
  format(
    "Fitness and mind-body",
    "Boxing classes",
    "fitness_class",
    "boxing classes near me",
    ["boxing club near me"],
  ),
  format(
    "Fitness and mind-body",
    "Kickboxing",
    "fitness_class",
    "kickboxing classes near me",
    ["kickboxing near me"],
  ),
  format(
    "Fitness and mind-body",
    "Martial arts",
    "fitness_class",
    "martial arts classes near me",
    ["martial arts near me"],
  ),
  format(
    "Fitness and mind-body",
    "Tai chi",
    "fitness_class",
    "tai chi classes near me",
    ["tai chi near me"],
  ),
  format(
    "Fitness and mind-body",
    "Dance fitness",
    "fitness_class",
    "dance fitness classes near me",
    ["dance workout near me"],
  ),
  format(
    "Fitness and mind-body",
    "Breathwork",
    "fitness_class",
    "breathwork near me",
    ["breathwork classes near me"],
    { repeatability: 4, differentiation: 4 },
  ),
  format(
    "Fitness and mind-body",
    "Sound baths",
    "fitness_class",
    "sound bath near me",
    ["sound healing near me"],
    { repeatability: 4, differentiation: 4 },
  ),
  format(
    "Fitness and mind-body",
    "Cold-water therapy",
    "fitness_class",
    "cold water therapy near me",
    ["cold plunge near me"],
    { operatingEase: 2 },
  ),
  format(
    "Fitness and mind-body",
    "Sauna sessions",
    "spa_asset",
    "sauna near me",
    ["sauna sessions near me"],
    { repeatability: 5 },
  ),
  format(
    "Fitness and mind-body",
    "Meditation classes",
    "fitness_class",
    "meditation classes near me",
    ["group meditation near me"],
  ),
  format(
    "Fitness and mind-body",
    "Mindfulness courses",
    "fitness_class",
    "mindfulness courses near me",
    ["mindfulness classes near me"],
  ),
  format(
    "Nature and animals",
    "Gardening workshops",
    "nature_class",
    "gardening workshops near me",
    ["gardening classes near me"],
  ),
  format(
    "Nature and animals",
    "Gardening clubs",
    "hobby_club",
    "gardening clubs near me",
    ["garden club near me"],
  ),
  format(
    "Nature and animals",
    "Allotment groups",
    "community_format",
    "allotments near me",
    ["allotment groups near me"],
    { commercialIntent: 1, socialDesign: 2, differentiation: 1 },
  ),
  format(
    "Nature and animals",
    "Foraging courses",
    "nature_class",
    "foraging courses near me",
    ["foraging walks near me"],
  ),
  format(
    "Nature and animals",
    "Mushroom foraging",
    "nature_class",
    "mushroom foraging near me",
    ["mushroom foraging course"],
  ),
  format(
    "Nature and animals",
    "Birdwatching groups",
    "outdoor_club",
    "bird watching groups near me",
    ["birdwatching club near me"],
  ),
  format(
    "Nature and animals",
    "Nature walks",
    "nature_class",
    "nature walks near me",
    ["guided nature walks near me"],
  ),
  format(
    "Nature and animals",
    "Forest bathing",
    "nature_class",
    "forest bathing near me",
    ["forest bathing events"],
  ),
  format(
    "Nature and animals",
    "Conservation volunteering",
    "community_format",
    "conservation volunteering near me",
    ["wildlife volunteering near me"],
  ),
  format(
    "Nature and animals",
    "Beekeeping courses",
    "nature_class",
    "beekeeping courses near me",
    ["beekeeping experience near me"],
  ),
  format(
    "Nature and animals",
    "Horse riding",
    "facility_sport",
    "horse riding near me",
    ["horse riding lessons near me"],
  ),
  format(
    "Nature and animals",
    "Dog-walking groups",
    "outdoor_club",
    "dog walking groups near me",
    ["group dog walks near me"],
  ),
  format(
    "Nature and animals",
    "Alpaca walks",
    "nature_class",
    "alpaca walking near me",
    ["alpaca walks near me"],
    { repeatability: 2, socialDesign: 3 },
  ),
  format(
    "Nature and animals",
    "Farm experiences",
    "nature_class",
    "farm experiences near me",
    ["farm events near me"],
    { repeatability: 2 },
  ),
  format(
    "Nature and animals",
    "Wildlife-photography workshops",
    "nature_class",
    "wildlife photography workshops uk",
    ["wildlife photography courses near me"],
  ),
  format(
    "Wellness, spa and retreats",
    "Spa days",
    "spa_asset",
    "spa day near me",
    ["spa days near me"],
  ),
  format(
    "Wellness, spa and retreats",
    "Spa breaks",
    "spa_asset",
    "spa breaks uk",
    ["spa break near me"],
    { commercialIntent: 5, revenueDepth: 5 },
  ),
  format(
    "Wellness, spa and retreats",
    "Spa weekends",
    "spa_asset",
    "spa weekends uk",
    ["spa weekend near me"],
    { commercialIntent: 5, revenueDepth: 5 },
  ),
  format(
    "Wellness, spa and retreats",
    "Spa retreats",
    "retreat",
    "spa retreats uk",
    ["spa retreat near me"],
  ),
  format(
    "Wellness, spa and retreats",
    "Wellness retreats",
    "retreat",
    "wellness retreats uk",
    ["wellness retreat near me"],
  ),
  format(
    "Wellness, spa and retreats",
    "Yoga retreats",
    "retreat",
    "yoga retreats uk",
    ["yoga retreat near me"],
    { repeatability: 4 },
  ),
  format(
    "Wellness, spa and retreats",
    "Meditation retreats",
    "retreat",
    "meditation retreats uk",
    ["meditation retreat near me"],
  ),
  format(
    "Wellness, spa and retreats",
    "Silent retreats",
    "retreat",
    "silent retreat uk",
    ["silent retreat near me"],
    { socialDesign: 1, differentiation: 5 },
  ),
  format(
    "Wellness, spa and retreats",
    "Detox retreats",
    "retreat",
    "detox retreats uk",
    ["detox retreat near me"],
    { socialDesign: 3 },
  ),
  format(
    "Wellness, spa and retreats",
    "Women's retreats",
    "retreat",
    "womens retreats uk",
    ["womens retreat near me"],
    { socialDesign: 5 },
  ),
  format(
    "Wellness, spa and retreats",
    "Men's retreats",
    "retreat",
    "mens retreats uk",
    ["mens retreat near me"],
    { socialDesign: 5, differentiation: 5 },
  ),
  format(
    "Wellness, spa and retreats",
    "Couples retreats",
    "retreat",
    "couples retreats uk",
    ["couples retreat near me"],
    { socialDesign: 2 },
  ),
  format(
    "Wellness, spa and retreats",
    "Fitness retreats",
    "retreat",
    "fitness retreats uk",
    ["fitness retreat near me"],
    { repeatability: 4 },
  ),
  format(
    "Wellness, spa and retreats",
    "Writing retreats",
    "retreat",
    "writing retreats uk",
    ["writing retreat near me"],
    { repeatability: 4, socialDesign: 4 },
  ),
  format(
    "Wellness, spa and retreats",
    "Art retreats",
    "retreat",
    "art retreats uk",
    ["art retreat near me"],
    { repeatability: 4 },
  ),
  format(
    "Wellness, spa and retreats",
    "Corporate retreats",
    "retreat",
    "corporate retreats uk",
    ["team retreat uk"],
    { commercialIntent: 5, socialDesign: 5, revenueDepth: 5 },
  ),
  format(
    "Wellness, spa and retreats",
    "Wellbeing workshops",
    "fitness_class",
    "wellbeing workshops near me",
    ["wellness workshops near me"],
  ),
  format(
    "Technical and maker hobbies",
    "Coding workshops",
    "technical_workshop",
    "coding workshops near me",
    ["coding classes near me"],
  ),
  format(
    "Technical and maker hobbies",
    "Robotics workshops",
    "technical_workshop",
    "robotics workshops near me",
    ["robotics classes near me"],
  ),
  format(
    "Technical and maker hobbies",
    "Electronics workshops",
    "technical_workshop",
    "electronics workshops near me",
    ["electronics courses near me"],
  ),
  format(
    "Technical and maker hobbies",
    "3D-printing workshops",
    "technical_workshop",
    "3d printing workshops near me",
    ["3d printing course near me"],
  ),
  format(
    "Technical and maker hobbies",
    "Makerspaces",
    "hobby_club",
    "makerspace near me",
    ["maker space near me"],
  ),
  format(
    "Technical and maker hobbies",
    "Repair cafes",
    "community_format",
    "repair cafe near me",
    ["repair cafes near me"],
  ),
  format(
    "Technical and maker hobbies",
    "DIY workshops",
    "technical_workshop",
    "diy workshops near me",
    ["diy classes near me"],
  ),
  format(
    "Technical and maker hobbies",
    "Car clubs",
    "hobby_club",
    "car clubs near me",
    ["classic car clubs near me"],
  ),
  format(
    "Technical and maker hobbies",
    "Motorcycle clubs",
    "hobby_club",
    "motorcycle clubs near me",
    ["motorbike clubs near me"],
  ),
  format(
    "Technical and maker hobbies",
    "LEGO clubs",
    "hobby_club",
    "lego club near me",
    ["adult lego club near me"],
  ),
  format(
    "Technical and maker hobbies",
    "Model-making clubs",
    "hobby_club",
    "model making clubs near me",
    ["model railway clubs near me"],
  ),
  format(
    "Technical and maker hobbies",
    "Drone clubs",
    "hobby_club",
    "drone club near me",
    ["drone groups near me"],
  ),
  format(
    "Community and alternative",
    "Volunteering",
    "community_format",
    "volunteering near me",
    ["volunteer events near me"],
    { commercialIntent: 1, revenueDepth: 1 },
  ),
  format(
    "Community and alternative",
    "Clothes swaps",
    "community_format",
    "clothes swap near me",
    ["clothes swap events near me"],
  ),
  format(
    "Community and alternative",
    "Phone-free events",
    "social_first",
    "phone free events",
    ["offline events near me"],
    { differentiation: 5 },
  ),
  format(
    "Community and alternative",
    "Silent discos",
    "participatory_performance",
    "silent disco near me",
    ["silent disco events near me"],
    { repeatability: 3 },
  ),
  format(
    "Community and alternative",
    "Community choirs",
    "community_format",
    "community choir near me",
    ["community choirs near me"],
    { commercialIntent: 3, revenueDepth: 3 },
  ),
  format(
    "Community and alternative",
    "Community gardening",
    "community_format",
    "community gardening near me",
    ["community garden events"],
  ),
  format(
    "Community and alternative",
    "Litter-picking groups",
    "community_format",
    "litter picking groups near me",
    ["litter picking events near me"],
    { commercialIntent: 1, revenueDepth: 1 },
  ),
];

function normalized(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function csvCell(value) {
  const rendered = Array.isArray(value) ? value.join("|") : String(value ?? "");
  return /[",\n]/.test(rendered)
    ? `"${rendered.replaceAll('"', '""')}"`
    : rendered;
}

function toCsv(columns, rows) {
  return `${columns.join(",")}\n${rows
    .map((row) => columns.map((column) => csvCell(row[column])).join(","))
    .join("\n")}\n`;
}

function money(micros) {
  return (Number(micros ?? 0) / 1_000_000).toFixed(4);
}

function monthlySeries(values) {
  return values
    .map(
      ({ year, month, monthlySearches }) =>
        `${year}-${String(month).toLowerCase()}:${Number(monthlySearches ?? 0)}`,
    )
    .join("|");
}

function demandScore(volume) {
  if (volume >= 10_000) return 20;
  if (volume >= 5_000) return 18;
  if (volume >= 2_500) return 16;
  if (volume >= 1_000) return 14;
  if (volume >= 500) return 12;
  if (volume >= 200) return 10;
  if (volume >= 100) return 8;
  if (volume >= 50) return 6;
  if (volume >= 10) return 4;
  return 0;
}

function weightedRating(value, weight) {
  return (Number(value) / 5) * weight;
}

function launchDecision(score) {
  if (score >= 86) return "priority_pilot";
  if (score >= 78) return "strong_test";
  if (score >= 70) return "partner_led_test";
  if (score >= 62) return "selective_or_watchlist";
  return "deprioritise_as_launch_wedge";
}

function intentCaveat(item) {
  if (item.name === "Social clubs")
    return "Mixed with private members clubs, sports clubs and venue discovery";
  if (item.name === "Allotment groups")
    return "Dominated by plot and tenancy discovery rather than paid events";
  if (item.name === "Volunteering" || item.name === "Litter-picking groups")
    return "Participation demand is real but consumer ticket intent is weak";
  if (item.archetype === "spectator_culture")
    return "Measures audience or venue discovery rather than stranger interaction";
  if (item.archetype === "spa_asset")
    return "Measures spa inventory demand rather than demand for a hosted social cohort";
  if (
    item.archetype === "facility_sport" ||
    item.archetype === "venue_entertainment"
  )
    return "May resolve to venue or facility booking rather than a managed social event";
  if (item.primary.includes("near me"))
    return "Local discovery signal may mix classes, venues, clubs and events";
  return "Format-specific phrase still may contain informational or non-commercial intent";
}

function seasonality(metric) {
  const observations = (metric?.monthlySearchVolumes ?? []).map((item) => ({
    label: `${item.year}-${String(item.month).toLowerCase()}`,
    searches: Number(item.monthlySearches ?? 0),
  }));
  const positive = observations.filter((item) => item.searches > 0);
  if (!positive.length) {
    return {
      peakMonth: "",
      peakSearches: 0,
      lowMonth: "",
      lowSearches: 0,
      peakToLowRatio: "",
    };
  }
  const peak = positive.reduce((best, item) =>
    item.searches > best.searches ? item : best,
  );
  const low = positive.reduce((best, item) =>
    item.searches < best.searches ? item : best,
  );
  return {
    peakMonth: peak.label,
    peakSearches: peak.searches,
    lowMonth: low.label,
    lowSearches: low.searches,
    peakToLowRatio: (peak.searches / low.searches).toFixed(2),
  };
}

loadGoogleAdsEnvironment();
const environment = requireEnvironment([
  "GOOGLE_ADS_DEVELOPER_TOKEN",
  "GOOGLE_ADS_CLIENT_ID",
  "GOOGLE_ADS_CLIENT_SECRET",
  "GOOGLE_ADS_REFRESH_TOKEN",
  "GOOGLE_ADS_CUSTOMER_ID",
]);

const submittedKeywords = [
  ...new Set(formats.flatMap((item) => [item.primary, ...item.support])),
];
const response = await fetchKeywordHistoricalMetrics({
  keywords: submittedKeywords,
  customerId: environment.GOOGLE_ADS_CUSTOMER_ID,
  loginCustomerId: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
  developerToken: environment.GOOGLE_ADS_DEVELOPER_TOKEN,
  clientId: environment.GOOGLE_ADS_CLIENT_ID,
  clientSecret: environment.GOOGLE_ADS_CLIENT_SECRET,
  refreshToken: environment.GOOGLE_ADS_REFRESH_TOKEN,
  apiVersion: process.env.GOOGLE_ADS_API_VERSION ?? DEFAULT_API_VERSION,
  languageId: process.env.GOOGLE_ADS_LANGUAGE_ID ?? DEFAULT_LANGUAGE_ID,
  geoTargetIds: DEFAULT_GEO_TARGET_IDS,
  network: "GOOGLE_SEARCH",
});

const metrics = metricsRows(response);
const metricByPhrase = new Map();
for (const metric of metrics) {
  for (const phrase of [metric.keyword, ...metric.closeVariants]) {
    metricByPhrase.set(normalized(phrase), metric);
  }
}

const keywordOwners = new Map();
for (const item of formats) {
  for (const phrase of [item.primary, ...item.support]) {
    const key = normalized(phrase);
    const owners = keywordOwners.get(key) ?? [];
    owners.push(`${item.family}: ${item.name}`);
    keywordOwners.set(key, owners);
  }
}

const keywordRows = metrics
  .map((metric) => {
    const matchedSubmittedKeywords = [metric.keyword, ...metric.closeVariants]
      .map(normalized)
      .filter((phrase) => keywordOwners.has(phrase));
    const matchedFormats = [
      ...new Set(
        matchedSubmittedKeywords.flatMap(
          (phrase) => keywordOwners.get(phrase) ?? [],
        ),
      ),
    ];
    return {
      returned_keyword: metric.keyword,
      close_variants: metric.closeVariants,
      matched_submitted_keywords: matchedSubmittedKeywords,
      matched_formats: matchedFormats,
      average_monthly_searches: metric.averageMonthlySearches,
      competition: metric.competition,
      competition_index: metric.competitionIndex,
      average_cpc_gbp: money(metric.averageCpcMicros),
      low_top_of_page_gbp: money(metric.lowTopOfPageBidMicros),
      high_top_of_page_gbp: money(metric.highTopOfPageBidMicros),
      monthly_search_volumes: monthlySeries(metric.monthlySearchVolumes),
      geography: "United Kingdom",
      geo_criterion: "2826",
      language: "English",
      language_criterion: "1000",
      network: "Google Search",
      observed_at: OBSERVED_AT,
      interpretation:
        matchedFormats.length > 1
          ? "Google grouped phrases used by more than one format; do not count the volume more than once"
          : "Rounded historical demand signal; not obtainable traffic or market size",
    };
  })
  .sort(
    (left, right) =>
      right.average_monthly_searches - left.average_monthly_searches ||
      left.returned_keyword.localeCompare(right.returned_keyword),
  );

const scoreRows = formats
  .map((item) => {
    const primaryMetric = metricByPhrase.get(normalized(item.primary));
    const ratings = archetypes[item.archetype];
    const [
      defaultCommercialIntent,
      defaultRepeatability,
      defaultSocialDesign,
      defaultOperatingEase,
      defaultRevenueDepth,
      defaultEventizationHeadroom,
    ] = ratings;
    const commercialIntent =
      item.overrides.commercialIntent ?? defaultCommercialIntent;
    const repeatability = item.overrides.repeatability ?? defaultRepeatability;
    const socialDesign = item.overrides.socialDesign ?? defaultSocialDesign;
    const operatingEase = item.overrides.operatingEase ?? defaultOperatingEase;
    const revenueDepth = item.overrides.revenueDepth ?? defaultRevenueDepth;
    const eventizationHeadroom =
      item.overrides.eventizationHeadroom ??
      item.overrides.differentiation ??
      defaultEventizationHeadroom;
    const primaryVolume = primaryMetric?.averageMonthlySearches ?? 0;
    const demand = demandScore(primaryVolume);
    const seasonal = seasonality(primaryMetric);
    const score = Math.round(
      demand +
        weightedRating(commercialIntent, 15) +
        weightedRating(repeatability, 15) +
        weightedRating(socialDesign, 15) +
        weightedRating(operatingEase, 10) +
        weightedRating(revenueDepth, 10) +
        weightedRating(eventizationHeadroom, 15),
    );
    const supportObservations = item.support.map((phrase) => {
      const supportMetric = metricByPhrase.get(normalized(phrase));
      return `${phrase}:${supportMetric?.averageMonthlySearches ?? 0}`;
    });
    const closeVariantGroup = primaryMetric
      ? [primaryMetric.keyword, ...primaryMetric.closeVariants]
      : [];
    return {
      rank: 0,
      family: item.family,
      format: item.name,
      archetype: item.archetype,
      primary_keyword: item.primary,
      returned_keyword: primaryMetric?.keyword ?? "not_returned",
      close_variant_group: closeVariantGroup,
      primary_average_monthly_searches: primaryVolume,
      support_keyword_observations: supportObservations,
      competition: primaryMetric?.competition ?? "UNSPECIFIED",
      competition_index: primaryMetric?.competitionIndex ?? 0,
      average_cpc_gbp: money(primaryMetric?.averageCpcMicros ?? 0),
      peak_month: seasonal.peakMonth,
      peak_searches: seasonal.peakSearches,
      low_month: seasonal.lowMonth,
      low_searches: seasonal.lowSearches,
      peak_to_low_ratio: seasonal.peakToLowRatio,
      demand_score_20: demand,
      commercial_intent_rating_5: commercialIntent,
      repeatability_rating_5: repeatability,
      social_design_rating_5: socialDesign,
      operating_ease_rating_5: operatingEase,
      revenue_depth_rating_5: revenueDepth,
      eventization_headroom_rating_5: eventizationHeadroom,
      launch_potential_score_100: score,
      decision: launchDecision(score),
      recommended_entry_model: entryModels[item.archetype],
      intent_caveat: intentCaveat(item),
      evidence_class: "observed_demand_plus_inference_score",
      evidence_coverage: "national_keyword_demand_and_format_structure",
      largest_unknown:
        "city-level paid conversion, fill rate, repeat attendance and event-level contribution",
      observed_at: OBSERVED_AT,
    };
  })
  .sort(
    (left, right) =>
      right.launch_potential_score_100 - left.launch_potential_score_100 ||
      right.primary_average_monthly_searches -
        left.primary_average_monthly_searches ||
      left.format.localeCompare(right.format),
  )
  .map((row, index) => ({ ...row, rank: index + 1 }));

const keywordColumns = [
  "returned_keyword",
  "close_variants",
  "matched_submitted_keywords",
  "matched_formats",
  "average_monthly_searches",
  "competition",
  "competition_index",
  "average_cpc_gbp",
  "low_top_of_page_gbp",
  "high_top_of_page_gbp",
  "monthly_search_volumes",
  "geography",
  "geo_criterion",
  "language",
  "language_criterion",
  "network",
  "observed_at",
  "interpretation",
];
const scoreColumns = [
  "rank",
  "family",
  "format",
  "archetype",
  "primary_keyword",
  "returned_keyword",
  "close_variant_group",
  "primary_average_monthly_searches",
  "support_keyword_observations",
  "competition",
  "competition_index",
  "average_cpc_gbp",
  "peak_month",
  "peak_searches",
  "low_month",
  "low_searches",
  "peak_to_low_ratio",
  "demand_score_20",
  "commercial_intent_rating_5",
  "repeatability_rating_5",
  "social_design_rating_5",
  "operating_ease_rating_5",
  "revenue_depth_rating_5",
  "eventization_headroom_rating_5",
  "launch_potential_score_100",
  "decision",
  "recommended_entry_model",
  "intent_caveat",
  "evidence_class",
  "evidence_coverage",
  "largest_unknown",
  "observed_at",
];

mkdirSync(PUBLIC_DIRECTORY, { recursive: true });
mkdirSync(PRIVATE_DIRECTORY, { recursive: true });
writeFileSync(
  join(PUBLIC_DIRECTORY, "event-format-keyword-ledger.csv"),
  toCsv(keywordColumns, keywordRows),
);
writeFileSync(
  join(PUBLIC_DIRECTORY, "event-format-opportunity-scorecard.csv"),
  toCsv(scoreColumns, scoreRows),
);
writeFileSync(
  join(PRIVATE_DIRECTORY, "google-ads-event-format-demand-sanitized.json"),
  `${JSON.stringify(
    {
      observedAt: OBSERVED_AT,
      apiVersion: response.apiVersion,
      languageId: response.languageId,
      geoTargetIds: response.geoTargetIds,
      network: "GOOGLE_SEARCH",
      submittedKeywords,
      results: metrics,
    },
    null,
    2,
  )}\n`,
);

console.log(
  `Wrote ${keywordRows.length} returned keyword rows and ${scoreRows.length} format scores from ${submittedKeywords.length} submitted phrases.`,
);
