include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-warpengine
PKG_VERSION:=2025.12.28
PKG_RELEASE:=2

LUCI_TITLE:=LuCI support for WarpEngine (Ultra Edition)
LUCI_DEPENDS:=+warpengine +luci-base +luci-compat
LUCI_PKGARCH:=all

include $(TOPDIR)/feeds/luci/luci.mk

# 关键修正：显式定义安装后的权限处理逻辑
# 注意：一定要放在 include luci.mk 之后，并确保没有冲突
define Package/$(PKG_NAME)/postinst
#!/bin/sh
if [ -z "$${IPKG_INSTROOT}" ]; then
	# 赋予后端脚本执行权限（解决 RPC 报错的核心）
	[ -f /usr/libexec/rpcd/luci.warpengine ] && chmod 0755 /usr/libexec/rpcd/luci.warpengine
	# 重启 rpcd 以应用 ACL 权限和新脚本
	/etc/init.d/rpcd restart
	# 清理 LuCI 缓存
	rm -rf /tmp/luci-indexcache /tmp/luci-modulecache
fi
exit 0
endef

# 注意：正如你所发现的，这里【绝对不要】再写 $(eval $(call BuildPackage,...))
# 因为 luci.mk 内部已经帮你调用过了。

