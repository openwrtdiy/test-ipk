include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-warpengine
PKG_VERSION:=2025.12.27
PKG_RELEASE:=1

LUCI_TITLE:=LuCI support for WarpEngine (Ultra Edition)
LUCI_DEPENDS:=+warpengine +luci-base +luci-compat
LUCI_PKGARCH:=all

# 引入 LuCI 宏：它会自动处理 root/、htdocs/、po/ 目录，并自动调用 BuildPackage
include $(TOPDIR)/feeds/luci/luci.mk

# 增加安装后的脚本处理，确保 RPCD 后端有执行权限
define Package/$(PKG_NAME)/postinst
#!/bin/sh
if [ -z "$${IPKG_INSTROOT}" ]; then
	# 显式赋予 RPCD 状态获取脚本执行权限
	chmod 0755 /usr/libexec/rpcd/luci.warpengine 2>/dev/null
	# 清除 LuCI 缓存以激活新菜单和权限
	rm -rf /tmp/luci-indexcache /tmp/luci-modulecache
fi
exit 0
endef

# 【注意】这里不再需要手动写 $(eval $(call BuildPackage,...))
# 除非你有非标准的安装逻辑（如特殊的 postinst 脚本）

