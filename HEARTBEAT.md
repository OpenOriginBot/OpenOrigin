# HEARTBEAT.md

## 活跃定时任务

| 任务 | 脚本 | 定时规则 | 说明 |
|------|------|----------|------|
| 每日简报 | automations/scripts/daily-briefing.sh | 30 8 * * * | 生成每日摘要 |
| 夜间优化 | automations/scripts/self-optimize.sh | 0 2 * * * | 审计+低风险修复 |
| 文档更新 | automations/scripts/update-docs.sh | 0 23 * * * | 滚动更新系统文档 |
| 仓库备份 | automations/scripts/backup-repo.sh | 0 */6 * * * | 每6小时备份 |

## 最近执行状态

- **2026-04-03 21:36** backup-repo.sh ✅ 成功
- **2026-04-03 21:38** self-optimize.sh ✅ 得分 92/100
- **2026-04-03 21:39** daily-briefing.sh ✅ 成功
- **2026-04-03 21:40** update-docs.sh ✅ 成功

## 文档

配置说明：`docs/AUTOMATIONS.md`
