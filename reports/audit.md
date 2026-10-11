# Agent-readiness audit: IBM Carbon

Source: @carbon/themes 11.83.0 (white theme), @carbon/layout 11.61.0, @carbon/react 1.118.0.

## Tokens

- 235 theme tokens and 13 spacing tokens.
- 234 theme tokens resolve to a color; 31 color values are shared by two or more token names (207 names in all).
- 48 tokens end in a two-digit number (e.g. field01, field02, field03, fieldHover01). In the layer and field families the number tracks nesting depth; elsewhere it marks a variant. Either way, an agent cannot tell from the name which one to use.

Largest shared-value groups (an agent asked for "the primary text color" could pick any of these):

| Value | Token names |
| --- | --- |
| `#161616` | borderInverse, chatBubbleAgentText, chatBubbleUserText, chatHeaderText, chatPromptText, iconPrimary, layerSelectedInverse, syntaxAtom (+17 more) |
| `#0f62fe` | backgroundBrand, borderInteractive, chatAvatarUser, chatButton, focus, iconInteractive, interactive, linkPrimary (+12 more) |
| `#ffffff` | aiPopoverBackground, background, chatBubbleAgent, chatHeaderBackground, chatPromptBackground, chatShellBackground, field02, focusInset (+8 more) |
| `#343a3f` | syntaxArithmeticOperator, syntaxBitwiseOperator, syntaxBrace, syntaxBracket, syntaxCompareOperator, syntaxContentSeparator, syntaxDerefOperator, syntaxEscape (+8 more) |
| `#00539a` | syntaxAttribute, syntaxAttributeName, syntaxDefinition, syntaxDefinitionKeyword, syntaxDefinitionOperator, syntaxHeading, syntaxHeading1, syntaxHeading2 (+5 more) |
| `#c6c6c6` | borderDisabled, borderSubtle01, borderSubtle03, borderSubtleSelected01, borderSubtleSelected02, borderSubtleSelected03, borderTile01, borderTile03 (+4 more) |
| `#198038` | syntaxBlockComment, syntaxComment, syntaxDocComment, syntaxDocumentMeta, syntaxFloat, syntaxInteger, syntaxLineComment, syntaxMeta (+3 more) |
| `#e0e0e0` | borderSubtle00, borderSubtle02, chatBubbleBorder, chatBubbleUser, layerAccent01, layerAccent02, layerAccent03, layerSelected01 (+2 more) |

Token families by name prefix:

| Family | Count |
| --- | --- |
| syntax | 88 |
| layer | 29 |
| ai | 21 |
| chat | 21 |
| border | 16 |
| support | 11 |
| text | 9 |
| background | 8 |
| link | 8 |
| icon | 7 |
| field | 6 |
| focus | 3 |

## Components

- 357 named exports from @carbon/react; 219 (61%) are stable, user-facing components.
- The other 138 are skeleton loaders (56), experimental or preview APIs (91), context and provider plumbing (8), and constants (5).
- An agent choosing from the flat export list sees all of them as equally valid. Experimental APIs are the riskiest: they can change or disappear between releases.

Experimental exports:

`preview_FeatureFlags`, `preview_Layout`, `preview_LayoutDirection`, `preview_OverflowMenuV2`, `preview_PageSelector`, `preview_Pagination`, `preview_Text`, `preview_TextDirection`, `preview__AiSkeletonIcon`, `preview__AiSkeletonPlaceholder`, `preview__AiSkeletonText`, `preview__Card`, `preview__ChatButton`, `preview__ChatButtonSkeleton`, `preview__DatePicker`, `preview__Dialog`, `preview__FluidComboBox`, `preview__FluidComboBoxSkeleton`, `preview__FluidDatePicker`, `preview__FluidDatePickerInput`, `preview__FluidDatePickerSkeleton`, `preview__FluidDropdown`, `preview__FluidDropdownSkeleton`, `preview__FluidMultiSelect`, `preview__FluidMultiSelectSkeleton`, `preview__FluidNumberInput`, `preview__FluidNumberInputSkeleton`, `preview__FluidSearch`, `preview__FluidSearchSkeleton`, `preview__FluidSelect`, `preview__FluidSelectSkeleton`, `preview__FluidTextArea`, `preview__FluidTextAreaSkeleton`, `preview__FluidTextInput`, `preview__FluidTextInputSkeleton`, `preview__FluidTimePicker`, `preview__FluidTimePickerSelect`, `preview__FluidTimePickerSkeleton`, `preview__IconIndicator`, `preview__PageHeader`, `preview__ShapeIndicator`, `preview__Slug`, `preview__SlugActions`, `preview__SlugContent`, `preview_useFeatureFlag`, `preview_useFeatureFlags`, `preview_useLayoutDirection`, `unstable_FeatureFlags`, `unstable_Layout`, `unstable_LayoutDirection`, `unstable_OverflowMenuV2`, `unstable_PageSelector`, `unstable_Pagination`, `unstable_Text`, `unstable_TextDirection`, `unstable__AiSkeletonIcon`, `unstable__AiSkeletonPlaceholder`, `unstable__AiSkeletonText`, `unstable__ChatButton`, `unstable__ChatButtonSkeleton`, `unstable__FluidComboBox`, `unstable__FluidComboBoxSkeleton`, `unstable__FluidDatePicker`, `unstable__FluidDatePickerInput`, `unstable__FluidDatePickerSkeleton`, `unstable__FluidDropdown`, `unstable__FluidDropdownSkeleton`, `unstable__FluidMultiSelect`, `unstable__FluidMultiSelectSkeleton`, `unstable__FluidNumberInput`, `unstable__FluidNumberInputSkeleton`, `unstable__FluidSearch`, `unstable__FluidSearchSkeleton`, `unstable__FluidSelect`, `unstable__FluidSelectSkeleton`, `unstable__FluidTextArea`, `unstable__FluidTextAreaSkeleton`, `unstable__FluidTextInput`, `unstable__FluidTextInputSkeleton`, `unstable__FluidTimePicker`, `unstable__FluidTimePickerSelect`, `unstable__FluidTimePickerSkeleton`, `unstable__IconIndicator`, `unstable__PageHeader`, `unstable__ShapeIndicator`, `unstable__Slug`, `unstable__SlugActions`, `unstable__SlugContent`, `unstable_useFeatureFlag`, `unstable_useFeatureFlags`, `unstable_useLayoutDirection`

## What this suggests for an agent guidelines file

1. Name one preferred token per intent (primary text, page background, interactive border) and mark the aliases as "do not pick".
2. Explain the numbered layer tokens with a rule: which number to use at which nesting depth.
3. Give the agent the stable component list only, with skeletons, experimental APIs and plumbing excluded unless asked for.
4. Check generated code with the on-system checker (npm run check) and track the score before and after the guidelines exist.
