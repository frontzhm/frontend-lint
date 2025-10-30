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
- [Rush](https://github.com/microsoft/rush)，rush是Microsoft开源的Monorepo管理工具。优点是适合大型企业项目；缺点是学习曲线较陡峭，对小型项目可能过于重量级。

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

### 📄 turbo.JSON

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

### 📄 package.JSON（根目录）

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
pnpm install yan-markdownlint-config markdownlint -D
```

## 使用

在 `.markdownlint.json` 中继承本包:

```json
{
  "extends": "yan-markdownlint-config"
}
```
````

再次声明这个包的作用，就是制定markdown文档的统一规范，并提供给其他项目使用。这个包需要安装markdownlint这个包，才能正常使用。

### 📄 package.JSON文件

package.JSON的内容如下：

```json
{
  "name": "yan-markdownlint-config",
  "version": "1.0.0",
  "description": "markdown文档规范",
  "main": "index.json",
  "keywords": ["markdown", "lint", "markdownlint", "markdownlint-config"],
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
```

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

### 📄 index.JSON 文件

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

### 📦 发布 markdown-lint-config 包

首先`package.json` 增加files字段，files字段是数组，表示需要发布的文件。

```json
{
  "files": ["index.json", "README.md"]
}
```

然后需要确保包已经准备好发布，并且已经登录npm。

```bash
# 进入包目录
cd packages/markdown-lint-config
# 检查包信息
pnpm info yan-markdownlint-config
# 登录 npm（如果还没有登录） npm login也是一样的
pnpm login
# 第二次的话增加版本号，这里使用patch版本号，如果是minor版本号，就是1.0.0 -> 1.1.0，如果是major版本号，就是1.0.0 -> 2.0.0
pnpm version patch/minor/major
# 发布包
pnpm publish
# 检查包是否发布成功
pnpm view yan-markdownlint-config
```

到这里，包就发布成功了，其他项目就可以使用这个包了。

### 🚀 在其他项目中使用 markdown-lint-config

### 方法一：通过 .markdownlint.JSON 配置文件

1. **在项目根目录创建 `.markdownlint.json` 文件：**

```json
{
  "extends": "yan-markdownlint-config"
}
```

1. **在项目的 package.JSON 中添加依赖：**

```json
{
  "devDependencies": {
    "yan-markdownlint-config": "workspace:*",
    "markdownlint": "^0.29.0",
    "markdownlint-cli": "^0.38.0"
  }
}
```

这里如果是其他项目，改成`"yan-markdownlint-config": "1.0.0",`，这里是其他子项目，所以直接使用`workspace:*`

1. **添加 lint 脚本：**

```json
{
  "scripts": {
    "lint:md": "markdownlint '**/*.md' --ignore node_modules",
    "lint:md:fix": "markdownlint '**/*.md' --ignore node_modules --fix"
  }
}
```

### 方法二：在 VSCode 中集成

1. **安装 VSCode 扩展：**
   - `markdownlint` (DavidAnson.vscode-markdownlint)

2. **在子项目根目录创建 `.vscode/settings.json`：**

```json
{
  "markdownlint.config": {
    "extends": "yan-markdownlint-config"
  }
}
```

### 📝 实战案例：创建 demo 项目使用 markdown-lint-config

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
    "yan-markdownlint-config": "workspace:*",
    "markdownlint": "^0.29.0",
    "markdownlint-cli": "^0.38.0"
  }
}
```

### 步骤 2：创建 Markdown 配置文件

创建 `.markdownlint.json`：

```json
{
  "extends": "yan-markdownlint-config"
}
```

### 步骤 3：创建示例 Markdown 文件

创建 `README.md`：

```markdown
# Demo Project

这是一个演示项目，用于展示如何使用 `yan-markdownlint-config`。

## 功能特性

- 使用统一的 Markdown 规范
- 支持 TypeScript
- 集成 ESLint 检查
- 自动修复 Markdown 格式问题
```

现在运行`pnpm lint:md`，就可以检查markdown文档的规范。

```shell
$ pnpm lint:md

> demo@1.0.0 lint:md /Users/zhm/0-core/400-前端/00-yf/codes/frontend-lint/apps/demo
> markdownlint '**/*.md' --ignore node_modules

README.md:3 MD012/no-multiple-blanks Multiple consecutive blank lines [Expected: 1; Actual: 2]
README.md:8:1 MD004/ul-style Unordered list style [Expected: dash; Actual: asterisk]
README.md:9:1 MD004/ul-style Unordered list style [Expected: dash; Actual: asterisk]
README.md:10:1 MD004/ul-style Unordered list style [Expected: dash; Actual: asterisk]
README.md:11:1 MD004/ul-style Unordered list style [Expected: dash; Actual: asterisk]
README.md:11:20 MD047/single-trailing-newline Files should end with a single newline character
 ELIFECYCLE  Command failed with exit code 1.
```

可以看到，有5个问题，都是关于markdown文档的规范。

我们运行`pnpm lint:md:fix`，就可以自动修复这些问题。

```shell
pnpm lint:md:fix
```

我们再次运行`pnpm lint:md`，就可以看到问题已经修复。

### 当前Turbo项目使用markdown-lint-config

其实和在其他项目中使用markdown-lint-config步骤是一样的，但是需要修改一下`turbo.json`文件，增加lint:md任务，表示需要等待所有依赖包的 Markdown 检查完成。

```json
{
  "tasks": {
    "lint:md": {
      "dependsOn": ["^lint:md"]
    }
  }
}
```

`package.json`里的`scripts`增加`lint:md`任务，表示需要等待所有依赖包的 Markdown 检查完成。

```json
  "scripts": {
    "lint:md": "markdownlint '**/*.md' --ignore node_modules --ignore .next --ignore dist",
    "lint:md:fix": "markdownlint '**/*.md' --ignore node_modules --ignore .next --ignore dist --fix"
  },

```

## .创建自己的包 - commit-lint-config

这个包的作用，就是根据commit message的规范，制定commit message的统一规范，并提供给其他项目使用。

```shell
cd packages
mkdir commit-lint-config
cd commit-lint-config
pnpm init
```

### README.md文件

README.md的内容如下：

````markdown
# `yan-commitlint-config`

> Git commit message 规范

支持配套的 [commitlint 配置](https://commitlint.js.org/#/concepts-shareable-config)，用于对 `git commit message` 进行校验。

## 安装

使用时，需要安装 [@commitlint/cli](https://www.npmjs.com/package/@commitlint/cli)：

```bash
pnpm install yan-commitlint-config @commitlint/cli -D
```

## 使用

在 `commitlint.config.js` 中集成本包:

```javascript
module.exports = {
  extends: ['yan-commitlint-config'],
};
```

## 设置 git hook

可通过 [husky](https://typicode.github.io/husky/get-started.htmly) 设置在 `git commit` 时触发 `commitlint`。

首先安装 husky：

```bash
pnpm install husky -D
```

然后执行添加`commit-msg`:

```bash
npx husky add .husky/commit-msg 'npx commitlint --edit $1'
```

更多信息可参考 [commitlint 文档](https://commitlint.js.org/#/guides-local-setup?id=install-husky)
````

再次声明这个包的作用，就是制定commit message的统一规范，并提供给其他项目使用。这个包需要安装commitlint这个包，才能正常使用。

### package.JSON文件

package.JSON的内容如下：

```json
{
  "name": "yan-commit-lint-config",
  "version": "1.0.0",
  "description": "commit lint config",
  "main": "index.js",
  "files": ["index.js", "README.md"],
  "keywords": ["commit", "lint", "commitlint", "commitlint-config"],
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
    "@commitlint/cli": "^20.1.0",
    "@commitlint/config-conventional": "^20.0.0"
  }
}
```

### 📄 index.js 文件

这个文件定义了 commitlint 的具体规则配置：

```js
module.exports = {
  parserPreset: 'conventional-changelog-conventionalcommits',
  rules: {
    'body-leading-blank': [1, 'always'],
    'body-max-line-length': [2, 'always', 100],
    'footer-leading-blank': [1, 'always'],
    'footer-max-line-length': [2, 'always', 100],
    'header-max-length': [2, 'always', 100],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [0],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'test', 'refactor', 'chore', 'revert'],
    ],
  },
};
```

### 📦 发布 commit-lint-config 包

需要确保包已经准备好发布，并且已经登录npm。

```bash
# 进入包目录
cd packages/commit-lint-config
# 检查包信息
pnpm info yan-commit-lint-config
# 登录 npm（如果还没有登录） npm login也是一样的
pnpm login
# 第二次的话增加版本号，这里使用patch版本号，如果是minor版本号，就是1.0.0 -> 1.1.0，如果是major版本号，就是1.0.0 -> 2.0.0
pnpm version patch/minor/major
# 发布包
pnpm publish
# 检查包是否发布成功
pnpm view yan-commit-lint-config
```

到这里，包就发布成功了，其他项目就可以使用这个包了。

### 在其他项目中使用 commit-lint-config，比如我的turbo项目中使用

#### 安装依赖

如果不是内部项目，`pnpm install yan-commit-lint-config -D`。

如果是内部项目，配置`package.json`文件，增加依赖。

```json
"devDependencies": {
  "yan-commit-lint-config": "workspace:*"
}
```

当然这个有依赖其他包，所以需要安装其他包。

```shell
pnpm install @commitlint/cli @commitlint/config-conventional -D
```

#### 配置commitlint

在项目根目录创建`commitlint.config.js`文件，内容如下：

```js
module.exports = {
  extends: ['yan-commit-lint-config'],
};
```

#### 配置simple-git-hooks

注意commit一般是使用git commit -m "commit message"来提交的，所以需要配置[simple-git-hooks](https://github.com/toplenboren/simple-git-hooks)来在commit时，执行commitlint检查。

```shell
# 安装simple-git-hooks
pnpm add simple-git-hooks -D
npx simple-git-hooks

```

`package.json`文件中，增加simple-git-hooks的配置。

```json
"simple-git-hooks": {
  "commit-msg": "commitlint --edit $1"
}
```

```shell
npx simple-git-hooks install
```

## 生成变更日志 TODO

## husky TODO

module.exports和exports
peerDependencies
devDependencies
dependencies

##
