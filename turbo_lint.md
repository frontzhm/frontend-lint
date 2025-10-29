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
npx create-turbo@latest
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
  - "apps/*"
  - "packages/*"
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

