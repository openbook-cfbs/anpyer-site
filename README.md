# AnPyer 官网（GitHub Pages 静态站）

合规用途的官网：Play 组织账户的官网验证 + 隐私政策 URL + 支持页。纯静态 HTML/CSS，零构建、零依赖，直接推到 GitHub Pages。

## 页面

| 路径 | 内容 | 对应 Play 需求 |
|---|---|---|
| `/` `/zh/` | 首页：一句话介绍、Play 链接、功能点、价格说明 | 商店页 Website |
| `/privacy/` `/zh/privacy/` | 隐私政策（英文为法律版本，中文译本注「以英文为准」） | Privacy policy URL（Console 填英文）；app 内 `links.ts` 按 locale 链两版 |
| `/terms/` `/zh/terms/` | 使用条款 | 非强制，Paid app 建议有 |
| `/support/` `/zh/support/` | 支持邮箱 + FAQ + bug 报告要点 | 商店页 Support |
| `/notices/` | 第三方开源声明，读同目录 `third-party-notices.json` 动态渲染（带筛选） | 与 app 内「关于 → 开源许可」同源 |
| `404.html` | GitHub Pages 自动接管 404 | —— |

`robots.txt` / `sitemap.xml` / `.nojekyll`（禁用 Jekyll，原样托管）/ `CNAME`（自定义域名）。

样式两份：`assets/site.css` 是全站基础（变量 / 顶栏 / 页脚 / 法务页排版，46rem 限宽）；`assets/landing.css` 只给首页（`body.landing`）—— 产品页风格，全宽色块纵向堆叠、内容 72rem 限宽、两栏交替、窄屏塔单列。首页的手机画面是纯 CSS mockup（`.phone`），真机截图到了换成 `<img>` 即可。

## 上线前必做

1. **替换占位符**（全站统一，见 `scripts/fill-placeholders.ps1` 头部说明）。~~`[DOMAIN]`~~ 与邮箱已于 2026-09-20 全站替换为 `anpyer.com` / `contact@anpyer.com`（含 `CNAME` / `robots.txt` / `sitemap.xml`）；~~注册地址 / 司法辖区~~ 已于 2026-09-20 整体砧掉（非必要不放；地址由 Play 商店页 trader 信息公开，条款不设适用法律节）。**剩余仅** `[COMPANY LEGAL NAME]` / `[公司法定名称]` —— **用户自己填**，填 Play Console 商店页显示的开发者名（两处逐字一致即可，不必是营业执照全名）。
   ```powershell
   pwsh -File scripts/fill-placeholders.ps1 -LegalNameEn "<Play 开发者名>" -LegalNameZh "<同上或中文>"
   ```
   脚本同时把 `AnPyer/src/generated/third-party-notices.json` 拷到 `notices/`（app 出包前跑过 `licenses.py --notice` 的话，两边就一致）。**发布者名必须与 Play Console 商店页显示的开发者名逐字一致**（Play User Data 政策：隐私政策需 reference the entity named in the listing）。
2. **核对隐私政策与 Data safety 表单一致**：本文按「collected = App activity / Other UGC + Files and docs（仅 AI 助手，可选，加密传输，不申报 shared）」写；Console 填表时口径要一样。
3. 隐私政策生效日期（两版顶部 `Effective date` / `生效日期`）改成实际上线日。
4. 回 AnPyer 仓库改 `src/config/links.ts`：`PRIVACY_POLICY_URL = 'https://anpyer.com/privacy/'`，`SUPPORT_EMAIL = 'contact@anpyer.com'`。`privacyPolicyUrlFor` 拼的是 `${URL}/zh` → 本站中文路径是 `/zh/privacy/`，**路径不同**，改 links.ts 时把它改成 `locale.startsWith('zh') ? 'https://anpyer.com/zh/privacy/' : PRIVACY_POLICY_URL`（或把本站中文页搬到 `/privacy/zh/`，二选一，建议改代码——语言前缀在前是站点通行做法）。

## 本地预览

任何静态服务器都行，**必须用服务器而不是双击文件**（站内链接是绝对路径 `/privacy/`，`notices` 页要 fetch JSON）：

```powershell
# 三选一
python -m http.server 8080          # Python
npx serve .                         # Node
pwsh -c "uv run --with rangehttpserver python -m RangeHTTPServer 8080"
```

然后开 `http://localhost:8080/`。

## 部署到 GitHub Pages

1. 新建 GitHub 仓库（公开或私有均可，Pages 免费版要求公开仓库），把本目录内容推到 `main`。
2. Settings → Pages → Build and deployment → Source = **Deploy from a branch**，Branch = `main` / `(root)`。
3. Settings → Pages → Custom domain 填域名 → Save（会自动写 `CNAME`，与本仓库已有的一致）。
4. DNS（在域名服务商处）：
   - **裸域** `example.com`：4 条 A 记录 → `185.199.108.153` `185.199.109.153` `185.199.110.153` `185.199.111.153`；可选 4 条 AAAA → `2606:50c0:8000::153` `…8001::153` `…8002::153` `…8003::153`
   - **子域 / www** `www.example.com`：1 条 CNAME → `<github用户名>.github.io`（**不是**仓库名）
   - 建议裸域 + www 都配，GitHub 自动把其中一个 301 到另一个。
   - **Cloudflare 用户**：记录设灰云（DNS only），否则 GitHub 签不了证书。
5. 等 DNS 生效（几分钟到几小时），Pages 页面显示 "DNS check successful" → 证书自动签发（Let's Encrypt）→ 勾 **Enforce HTTPS**。若长时间不出证书，检查域名有没有 CAA 记录限制了 `letsencrypt.org`。

## Search Console 验证（Play 组织账户强制）

用**注册 Play 的那个 Google 账号**：Search Console → 添加资源 → 选「**网域**」类型 → 按提示在 DNS 加一条 **TXT 记录**（`google-site-verification=...`）→ 验证。域名级验证覆盖裸域和全部子域，与托管在哪无关。之后回 Play Console 的官网验证会自动通过。

## 域名邮箱

> **已落地（2026-09-20 用户确认）**：域名 `anpyer.com`，Cloudflare 托管 DNS，HTTPS 已通；邮箱 **`contact@anpyer.com`** 走 Cloudflare Email Routing，**已测试可收**。站内邮箱已全站替换。剩余：DNS 把 A / CNAME 指到 GitHub Pages（**灰云 DNS only**，否则 GitHub 签不了证书 —— 若坚持橙云代理，则 Pages 侧不开 Enforce HTTPS，由 Cloudflare 终止 TLS，SSL 模式设 Full）。

Play 要求 contact / developer email 与官网同域。不必买邮箱套餐，两条免费路：

- **注册商自带邮件转发**（Namecheap / Porkbun / GoDaddy / 阿里云 / 腾讯云等大多有）：后台建 `support@<域名>` → 转到你的常用邮箱。实现方式是注册商替你托管 MX 记录，**收**信免费；**发**信要么在 Gmail「以其他地址发送」里配 SMTP（部分注册商提供），要么接受「收用域名邮箱、回信用个人邮箱」。
- **Cloudflare Email Routing**（免费，若 DNS 托在 Cloudflare）：同样只收不发，Gmail 侧可配「以此地址发送」。

Play 只校验邮箱能收到验证码，不校验发件人，所以「只收不发」完全够用。

## 维护

- 改隐私政策：两版同改，顶部日期 + 版本号递增；重大变更在 Play 版本说明里提一句。
- app 换了依赖：AnPyer 里 `uv run scripts/licenses.py --notice` → 重跑 `fill-placeholders.ps1`（或手动拷 JSON）。
- 没有任何构建步骤，改完 push 即上线（Pages 约 1 分钟生效）。
