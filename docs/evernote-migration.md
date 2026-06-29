# 从印象笔记迁移到 EdgeEver

EdgeEver 的印象笔记导入功能只支持开放、可读取的 ENEX 文件。EdgeEver 不直接支持印象笔记新版客户端导出的 `.notes` 文件。

这样做是为了降低迁移风险：ENEX 是可解析的 XML 格式，可以读取标题、正文、标签、创建时间和修改时间；新版 `.notes` 可能包含加密内容，EdgeEver 无法可靠验证其中数据。

## 准备 ENEX 文件

如果你的印象笔记客户端仍能直接导出 ENEX，可以按笔记本分别导出 `.enex` 文件。

如果客户端只能导出 `.notes`，可以参考第三方命令行工具 `evernote-backup` 先导出 ENEX：

```sh
pipx install evernote-backup
evernote-backup init-db --backend china
evernote-backup sync
evernote-backup export ./edgeever-import
```

说明：

- `--backend china` 用于连接印象笔记中国版。
- `sync` 会把账号里的笔记同步到本地数据库。
- `export ./edgeever-import` 会导出 ENEX 文件。
- `evernote-backup` 默认会按笔记本导出，一个笔记本对应一个 `.enex` 文件。

请把生成的 `.enex` 文件放在一个容易找到的目录中。文件名会作为 EdgeEver 导入时的目标笔记本名称。

## 在 Web 应用中导入

1. 在电脑浏览器中打开 EdgeEver。
2. 进入左侧“个人中心 / 我的”。
3. 找到“导入印象笔记”。
4. 选择一个或多个 `.enex` 文件。
5. 检查导入计划中的笔记本数量和笔记数量。
6. 点击“开始导入”。
7. 每导完一个笔记本，先在 EdgeEver 中检查结果，再点击“确认结果，继续下一个”。

移动端不开放导入入口。ENEX 文件通常较大，逐笔记本确认也更适合 PC 操作。

## 时间校验

EdgeEver 会强制保留印象笔记原始创建时间和修改时间：

- 如果 ENEX 中某条笔记缺少合法的创建时间或修改时间，导入会停止。
- 如果 EdgeEver 创建后的 `createdAt` 或 `updatedAt` 与 ENEX 原始时间不一致，导入会停止并显示对应笔记标题。

## 命令行导入

仓库内也提供命令行脚本，主要面向自托管管理员、开发者和需要批处理的高级用户。普通产品用户优先使用 Web 导入入口。

先配置 EdgeEver 连接：

```sh
bun run cli -- profile set prod --url https://你的域名 --token <api-token>
```

API Token 至少需要这些 scopes：

- `read:notebooks`
- `write:notebooks`
- `write:memos`

先生成导入计划：

```sh
bun run import:evernote -- --profile prod --input ./edgeever-import --dry-run
```

确认计划无误后正式导入：

```sh
bun run import:evernote -- --profile prod --input ./edgeever-import
```

命令行脚本也会按 ENEX 文件逐个笔记本导入，每导完一个笔记本后等待确认。

## 常见问题

### EdgeEver 为什么不直接支持 `.notes`？

印象笔记新版 `.notes` 文件可能包含 `encoding="base64:aes"` 加密内容。EdgeEver 无法可靠读取和校验这类文件，因此产品层面只承诺支持 ENEX。

### 附件和图片会怎样？

当前导入主要迁移文本内容、标题、标签和时间。ENEX 中的图片和附件会被转换成 `evernote-resource:<hash>` 形式的占位链接，便于后续定位原始资源。

### 笔记格式会完全一致吗？

不会完全一致。工具会把印象笔记的 XHTML 内容转换为 Markdown，再交给 EdgeEver 保存。常规标题、段落、列表、代码块、链接和待办项会尽量保留；复杂表格、加密块、特殊样式和附件需要迁移后抽查。
