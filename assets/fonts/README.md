# Fonts

- Inter 4.1, `web/Inter-Regular.woff2` from https://github.com/rsms/inter/releases/tag/v4.1
- JetBrains Mono 2.304, `fonts/webfonts/JetBrainsMono-{Regular,Medium,Bold}.woff2` from
  https://github.com/JetBrains/JetBrainsMono/releases/tag/v2.304

Both are licensed under the SIL Open Font License 1.1 (`Inter-OFL.txt`,
`JetBrainsMono-OFL.txt`). Neither declares a Reserved Font Name.

The `-latin` files are subsets of the release files made with fontTools
(`pyftsubset --layout-features='*' --flavor=woff2`) for the code points
U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC,
U+2000-206F, U+2074, U+20AC, U+2122, U+2190-2199, U+2212, U+2215, U+FEFF, U+FFFD.
