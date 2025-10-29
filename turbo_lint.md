# 用Turborepo搭建lint工具

## 补充一些前置知识

### 什么是Monorepo

Monorepo，Mono是单一的意思，repo就是仓库的意思，合起来就是 一个仓库管理多个项目。主要解决传统多仓库（Multi-repo，一个仓库管理一个项目）模式下的一些痛点，

- 代码安装阶段，依赖管理低效：
  多仓库模式下，各项目独立安装依赖，易出现冗余和版本冲突。Monorepo 通过共享依赖（如提升至根目录）减少重复安装，统一版本管理。

- 代码提交阶段，跨项目协作复杂：
  修改涉及多个仓库时，需分别提交和协调，流程繁琐。Monorepo 支持原子提交（一次提交修改多个项目），提升协作效率。

- 代码开发阶段，工具链碎片化：
  多仓库需维护多套配置（如 ESLint、构建工具），Monorepo 可统一工具链，减少配置冗余。

- 代码部署阶段，测试低效：
  多仓库需独立部署和测试，Monorepo 支持增量构建和并行测试，优化资源利用‌

- 代码发布阶段，代码复用与维护成本高‌
  在多仓库中，公共代码（如组件、工具函数）需通过 npm 包发布，修改时需重复发布和升级，易导致版本不一致‌。Monorepo 允许直接引用本地代码，避免重复开发和维护‌

monorepo 的实现方式有多种，比如：

- [Lerna](https://github.com/lerna/lerna)，lerna是facebook开源的Monorepo管理工具。优点是历史悠久，社区支持比较成熟，轻量级；缺点是对大型项目支持不够好，维护活跃度下降。
- **[Turborepo](https://github.com/vercel/turborepo)**，turborepo是vercel开源的Monorepo管理工具。优点是极快的构建速度（增量构建、并行执行），配置简单，支持多种框架；缺点是相对较新，生态还在发展。(个人推荐使用)
- [Nx](https://github.com/nrwl/nx)，nx是nrwl开源的Monorepo管理工具。优点是功能最全面，企业级特性丰富，插件生态丰富，适合大型复杂项目；缺点是配置相对复杂，学习曲线较陡峭，对于简单项目可能过于重量级。
- [Rush](https://github.com/microsoft/rush)，rush是microsoft开源的Monorepo管理工具。优点是适合大型企业项目；缺点是学习曲线较陡峭，对小型项目可能过于重量级。

当前最受欢迎的工具：

- Turborepo - 目前最热门的选择，特别适合中小型到中型项目，性能优秀，开发体验好（逐渐替代Lerna）
- Nx - 企业级首选，大型项目和复杂架构的首选，功能最全面，适合需要高度定制化的场景

### 什么是pnpm

pnpm 是一个快速、节省磁盘空间的包管理器。pnpm 通过硬链接（hard link）和符号链接（symbolic link）来存储依赖，而不是传统的复制（copy）。这使得 pnpm 的安装速度非常快，并且占用的磁盘空间更少。

pnpm 的优点是：

- 快速：安装速度快，占用的磁盘空间更少
- 节省磁盘空间：通过硬链接和符号链接来存储依赖，而不是传统的复制。

就是同一个依赖，只安装一次，不管是跨项目还是跨包依赖，不会重复安装，节省磁盘空间，并且安装速度非常快。

## 1. Turborepo创建项目模板

```bash
npx create-turbo@latest frontend-lint
```

然后生成项目结构：

```shell
$ tree . -L 2
.
├── README.md
├── apps
│   ├── docs
│   └── web
├── package.json
├── packages
│   ├── eslint-config
│   ├── typescript-config
│   └── ui
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── turbo.json
```

### 📁 目录结构详解

- **`apps/`** - 应用程序目录
  - `web/` - 主 Web 应用（端口 3000）
  - `docs/` - 文档应用（端口 3001）

- **`packages/`** - 共享包目录
  - `eslint-config/` - ESLint 配置包
  - `typescript-config/` - TypeScript 配置包
  - `ui/` - 共享 UI 组件库

- **根目录配置文件**
  - `package.json` - 根项目配置
  - `turbo.json` - Turborepo 构建配置
  - `pnpm-workspace.yaml` - pnpm 工作空间配置
  - `pnpm-lock.yaml` - 依赖锁定文件

### 📄 turbo.json

```json
{
  "$schema": "https://turborepo.com/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "check-types": {
      "dependsOn": ["^check-types"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**配置说明：**

- **`$schema`** - JSON Schema 定义，提供 IDE 智能提示
- **`ui: "tui"`** - 使用终端用户界面（Terminal UI）
- **`tasks`** - 定义构建任务和依赖关系

**任务配置详解：**

1. **`build` 任务**
   - `dependsOn: ["^build"]` - 依赖其他包的 build 任务先完成
   - `inputs` - 监听文件变化（默认文件 + .env 文件）
   - `outputs` - 输出目录（.next 构建产物，排除缓存）

2. **`lint` 任务**
   - `dependsOn: ["^lint"]` - 依赖其他包的 lint 任务

3. **`check-types` 任务**
   - `dependsOn: ["^check-types"]` - 依赖其他包的类型检查

4. **`dev` 任务**
   - `cache: false` - 开发模式不缓存
   - `persistent: true` - 持久运行（不会自动结束）

### 📄 package.json（根目录）

```json
{
  "name": "frontend-lint",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "check-types": "turbo run check-types"
  },
  "devDependencies": {
    "prettier": "^3.6.2",
    "turbo": "^2.5.8",
    "typescript": "5.9.2"
  },
  "packageManager": "pnpm@9.0.0",
  "engines": {
    "node": ">=18"
  }
}
```

**配置说明：**

- **`name`** - 项目名称
- **`private: true`** - 私有包，不会发布到 npm
- **`scripts`** - 可执行的脚本命令
  - `build` - 构建所有应用和包
  - `dev` - 启动开发模式
  - `lint` - 运行代码检查
  - `format` - 格式化代码
  - `check-types` - 类型检查
- **`devDependencies`** - 开发依赖
  - `turbo` - Turborepo 核心工具
  - `prettier` - 代码格式化工具
  - `typescript` - TypeScript 编译器
- **`packageManager`** - 指定使用 pnpm 9.0.0
- **`engines`** - 指定 Node.js 版本要求（>=18）

### 📄 pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

**配置说明：**

- 定义 pnpm 工作空间范围
- `apps/*` - 包含所有 apps 目录下的子项目，应用层
- `packages/*` - 包含所有 packages 目录下的子项目，包层

### 🚀 常用命令

```bash
# 安装依赖(会自动安装所有应用和包的依赖)
pnpm install

# 启动开发模式(会自动启动所有应用和包的开发模式)
pnpm dev

# 构建所有项目(会自动构建所有应用和包)
pnpm build

# 运行代码检查(会自动运行所有应用和包的代码检查)
pnpm lint

# 格式化代码(会自动格式化所有应用和包的代码)
pnpm format

# 类型检查(会自动检查所有应用和包的类型)
pnpm check-types
```

## 2.创建自己的包 - markdown-lint-config

这个包的作用，就是根据markdown文档的规范，制定markdown文档的统一规范，并提供给其他项目使用。

在packages目录下创建包目录和配置文件

```bash
cd packages
mkdir markdown-lint-config
cd markdown-lint-config
pnpm init
```

### README.md文件

README.md的内容如下：

````markdown
# markdownlint-config

> markdown文档 规范

支持配套的 [markdownlint 可共享配置](https://www.npmjs.com/package/markdownlint#optionsconfig)。

## 安装

需要先行安装 [markdownlint](https://www.npmjs.com/package/markdownlint)：

```bash
pnpm install @frontend-lint/markdown-lint-config markdownlint -D
```

## 使用

在 `.markdownlint.json` 中继承本包:

```json
{
  "extends": "@frontend-lint/markdown-lint-config"
}
```

````

再次声明这个包的作用，就是制定markdown文档的统一规范，并提供给其他项目使用。这个包需要安装markdownlint这个包，才能正常使用。

### 📄 package.json文件

package.json的内容如下：

```json
{
  "name": "@frontend-lint/markdown-lint-config",
  "version": "1.0.0",
  "description": "markdown文档规范",
  "main": "index.json",
  "keywords": [
    "markdown",
    "lint",
    "markdownlint",
    "markdownlint-config"
  ],
  "author": "frontzhm@163.com",
  "homepage": "https://github.com/frontzhm/frontend-lint#readme",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/frontzhm/frontend-lint.git"
  },
  "bugs": {
    "url": "https://github.com/frontzhm/frontend-lint/issues"
  },
  "peerDependencies": {
    "markdownlint": "^0.29.0"
  }
}
````

**字段含义详解：**

- **`name`** - 包名，必须唯一，用于 npm 发布和安装时的标识符，如果以 @ 开头，表示这是一个 scoped 包，比如 @vue3/markdown-lint-config
- **`version`** - 版本号，遵循语义化版本规范（SemVer），格式：主版本.次版本.修订版本
- **`description`** - 包的简短描述，会显示在 npm 搜索结果中
- **`main`** - 包的入口文件，当其他项目 `require()` 或 `import` 这个包时，会加载此文件
- **`keywords`** - 关键词数组，用于 npm 搜索和分类，帮助用户发现这个包
- **`author`** - 作者信息，可以是字符串或对象格式
- **`homepage`** - 项目主页 URL，通常是 GitHub 仓库页面或项目官网
- **`license`** - 开源许可证类型，如 MIT、Apache-2.0、GPL 等
- **`repository`** - 代码仓库信息，包含类型（git）和 URL
- **`bugs`** - 问题反馈地址，通常是 GitHub Issues 页面
- **`peerDependencies`** - 对等依赖，表示这个包需要宿主项目安装的依赖，不会自动安装

### 📄 index.json 文件

这个文件定义了 markdownlint 的具体规则配置：

```json
{
  "$schema": "https://raw.githubusercontent.com/DavidAnson/markdownlint/main/schema/markdownlint-config-schema.json",
  "default": true,
  "ul-style": {
    "style": "dash"
  },
  "no-trailing-spaces": {
    "br_spaces": 0,
    "list_item_empty_lines": false
  },
  "list-marker-space": false,
  "line-length": false,
  "no-inline-html": false,
  "no-duplicate-header": false,
  "proper-names": {
    "names": [
      "JavaScript",
      "HTML",
      "CSS",
      "AJAX",
      "JSON",
      "DOM",
      "BOM",
      "Less",
      "Sass",
      "SCSS",
      "HTTP",
      "HTTPS",
      "WebSocket",
      "ECMAScript",
      "ECMAScript 2015",
      "ECMAScript 6",
      "ES6",
      "ES2015",
      "jQuery",
      "jQuery Mobile",
      "React",
      "React Native",
      "Bootstrap",
      "Gulp",
      "Grunt",
      "webpack",
      "Yeoman",
      "npm",
      "spm",
      "Babel",
      "Mocha",
      "Jasmine",
      "PHP",
      "Java",
      "Node.js",
      "NodeJS",
      "MySQL",
      "MongoDB",
      "Redis",
      "Apache",
      "Nginx",
      "NGINX",
      "GitHub",
      "GitLab",
      "GitCafe",
      "Chrome",
      "Firefox",
      "Safari",
      "Internet Explore",
      "IE",
      "IE 7",
      "Opera",
      "UC",
      "Android",
      "iOS",
      "Windows",
      "OS X",
      "Ubuntu",
      "Linux",
      "Debian",
      "PC",
      "Mobile",
      "H5",
      "MacBook",
      "MacBook Pro",
      "MacBook Air",
      "iMac",
      "Mac Pro",
      "iPad",
      "Mac mini",
      "iPad Air",
      "iPad Air 2",
      "iPad mini",
      "iPhone",
      "iPhone 6s",
      "iPhone 6s Plus",
      "Apple Watch",
      "Alibaba",
      "Taobao",
      "Google",
      "Alphabet",
      "Apple",
      "Microsoft",
      "Yahoo",
      "FPS",
      "UI",
      "URL",
      "URI",
      "URLs",
      "URIs",
      "Visual Studio Code"
    ],
    "code_blocks": false
  }
}
```

**配置规则详解：**

- **`$schema`** - JSON Schema 定义，提供 IDE 智能提示和验证
- **`default: true`** - 启用所有默认的 markdownlint 规则
- **`ul-style`** - 无序列表样式规则
  - `style: "dash"` - 使用短横线 `-` 作为列表标记符
- **`no-trailing-spaces`** - 禁止行尾空格规则
  - `br_spaces: 0` - 不允许行尾有空格
  - `list_item_empty_lines: false` - 列表项之间允许空行
- **`list-marker-space: false`** - 关闭列表标记后必须有空格的检查
- **`line-length: false`** - 关闭行长度限制检查
- **`no-inline-html: false`** - 允许在 Markdown 中使用 HTML 标签
- **`no-duplicate-header: false`** - 允许重复的标题
- **`proper-names`** - 专有名词规则
  - `names` - 定义正确的专有名词拼写（如 JavaScript、React、Node.js 等）
  - `code_blocks: false` - 在代码块中不检查专有名词拼写

## 🚀 在其他子项目中使用 markdown-lint-config

### 方法一：通过 .markdownlint.json 配置文件

1. **在子项目根目录创建 `.markdownlint.json` 文件：**

```json
{
  "extends": "@frontend-lint/markdown-lint-config"
}
```

2. **在子项目的 package.json 中添加依赖：**

```json
{
  "devDependencies": {
    "@frontend-lint/markdown-lint-config": "workspace:*",
    "markdownlint": "^0.29.0",
    "markdownlint-cli": "^0.38.0"
  }
}
```

3. **添加 lint 脚本：**

```json
{
  "scripts": {
    "lint:md": "markdownlint '**/*.md' --ignore node_modules",
    "lint:md:fix": "markdownlint '**/*.md' --ignore node_modules --fix"
  }
}
```

### 方法二：直接在命令行中使用

```bash
# 检查所有 Markdown 文件
npx markdownlint '**/*.md' --config packages/markdown-lint-config/index.json

# 检查特定文件
npx markdownlint README.md --config packages/markdown-lint-config/index.json

# 自动修复可修复的问题
npx markdownlint '**/*.md' --config packages/markdown-lint-config/index.json --fix
```

### 方法三：在 VSCode 中集成

1. **安装 VSCode 扩展：**
   - `markdownlint` (DavidAnson.vscode-markdownlint)

2. **在子项目根目录创建 `.vscode/settings.json`：**

```json
{
  "markdownlint.config": {
    "extends": "@frontend-lint/markdown-lint-config"
  }
}
```

### 方法四：在 CI/CD 中使用

**GitHub Actions 示例：**

```yaml
name: Markdown Lint
on: [push, pull_request]

jobs:
  markdown-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: pnpm install
      - run: pnpm run lint:md
```

### 实际使用示例

假设在 `apps/web` 项目中使用：

1. **安装依赖：**

```bash
cd apps/web
pnpm add @frontend-lint/markdown-lint-config markdownlint markdownlint-cli -D
```

2. **创建 `.markdownlint.json`：**

```json
{
  "extends": "@frontend-lint/markdown-lint-config"
}
```

3. **在 package.json 中添加脚本：**

```json
{
  "scripts": {
    "lint:md": "markdownlint '**/*.md' --ignore node_modules --ignore .next",
    "lint:md:fix": "markdownlint '**/*.md' --ignore node_modules --ignore .next --fix"
  }
}
```

4. **运行检查：**

```bash
# 检查所有 Markdown 文件
pnpm run lint:md

# 自动修复问题
pnpm run lint:md:fix
```

### 配置自定义规则

如果需要覆盖某些规则，可以在 `.markdownlint.json` 中自定义：

```json
{
  "extends": "@frontend-lint/markdown-lint-config",
  "line-length": {
    "line_length": 120
  },
  "ul-style": {
    "style": "asterisk"
  }
}
```

### 忽略特定文件

创建 `.markdownlintignore` 文件：

```
node_modules/
.next/
dist/
*.min.md
```

这样，您就可以在任何子项目中轻松使用统一的 Markdown 规范了！

## 📝 实战案例：创建 demo 项目使用 markdown-lint-config

让我们在 `apps` 目录下创建一个 `demo` 项目来演示如何使用 `markdown-lint-config`。

### 步骤 1：创建 demo 项目目录

```bash
# 在项目根目录执行
mkdir -p apps/demo
cd apps/demo
pnpm init
```


编辑生成的 `package.json`，内容如下：

```json
{
  "name": "demo",
  "version": "1.0.0",
  "description": "Demo project using markdown-lint-config",
  "scripts": {
    "lint:md": "markdownlint '**/*.md' --ignore node_modules",
    "lint:md:fix": "markdownlint '**/*.md' --ignore node_modules --fix"
  },
  "devDependencies": {
    "@frontend-lint/markdown-lint-config": "workspace:*",
    "markdownlint": "^0.29.0",
    "markdownlint-cli": "^0.38.0"
  }
}
```

### 步骤 2：创建 Markdown 配置文件

创建 `.markdownlint.json`：

```json
{
  "extends": "@frontend-lint/markdown-lint-config"
}
```

### 步骤 3：创建示例 Markdown 文件

创建 `README.md`：

```markdown
# Demo Project


这是一个演示项目，用于展示如何使用 `@frontend-lint/markdown-lint-config`。

## 功能特性

* 使用统一的 Markdown 规范
* 支持 TypeScript
* 集成 ESLint 检查
* 自动修复 Markdown 格式问题

```

