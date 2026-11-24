# Parabola

Parabola is a style, not a design system in the traditional sense, although
it contains components. **Fixed below, free above:** the basics are those of a
design system (tokens, buttons, fields, a spacing scale), and they leave room
for visual expression, so any model can experiment on top of them and a
site still reads as one thing from page to page.

**Make your theme at [parabolasystem.com](https://parabolasystem.com).**
Pick a style, change colours, type and buttons, and see it on a website, a
letter, an app, an Instagram carousel and a reel at once.

## Take your style anywhere

Press **Export**, top right on parabolasystem.com:

- **The style in words:** copy it and paste it at the end of any prompt
  ("make a website, in this style"). Works with any AI.
- **Brand kit:** a zip with a brand guide, the tokens and the theme file.
- **Design system:** one text for Claude Design or any agent to build a
  design system from.
- **Parabola code**, and a command that copies the theme into a project.

## Use it in a project

Copy the theme, or a component, into your project and own the files:

```sh
npx github:alexbeltechi/parabola add theme --from parabola-theme.json
npx github:alexbeltechi/parabola add button
```

Or install the whole package (React 19, Tailwind CSS v4) from GitHub, at a
version:

```sh
npm install github:alexbeltechi/parabola#v0.6.0
```

```tsx
import { DsButton } from "@beltechi/parabola";

<DsButton variant="primary">Publish</DsButton>
```

The setup (tokens, provider, theme) is in
[the reference](docs/reference.md#installing). Parabola isn't on npm yet.

## More

- [The reference](docs/reference.md): tiers, themes, sharing, the command,
  taking a newer version, the component contract. For developers and agents.
- [What changed in each version](CHANGELOG.md).
- Parabola is what [Darmio](https://github.com/alexbeltechi/darmio), an
  open-source publishing platform for makers, is built on.

## Licence

MIT, see [LICENSE](LICENSE).
