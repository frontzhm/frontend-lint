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
  extends: ['yan-commitlint-config']
};
```

## 设置 git hook

可通过 [simple-git-hooks](https://typicode.github.io/simple-git-hooks/get-started.htmly) 设置在 `git commit` 时触发 `commitlint`。

首先安装 simple-git-hooks：

```bash
pnpm install simple-git-hooks -D
```

然后执行添加`commit-msg`:

```bash
npx simple-git-hooks add .simple-git-hooks/commit-msg 'npx commitlint --edit $1'
```

更多信息可参考 [commitlint 文档](https://commitlint.js.org/#/guides-local-setup?id=install-simple-git-hooks)
