include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-turboacc
PKG_RELEASE:=1

include $(INCLUDE_DIR)/package.mk

# 定义包的基本信息
define Package/luci-app-turboacc
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=3. Applications
  TITLE:=LuCI support for Flow Offloading (Native)
  DEPENDS:=+firewall4 +kmod-nft-offload +kmod-tcp-bbr +kmod-nft-fullcone
  PKGARCH:=all
endef

# 二级菜单配置
define Package/luci-app-turboacc/config
menu "Configuration"
	depends on PACKAGE_luci-app-turboacc
	config PACKAGE_luci-app-turboacc_INCLUDE_OFFLOADING
		bool "Enable Software Flow Offloading"
		default y
	config PACKAGE_luci-app-turboacc_INCLUDE_BBR_CCA
		bool "Enable BBR CCA"
		default y
	config PACKAGE_luci-app-turboacc_INCLUDE_FULLCONE
		bool "Include FullCone NAT (nftables)"
		default y
endmenu
endef

# --- 关键修改：添加下面这三行 ---
define Build/Compile
endef
# --

define Package/luci-app-turboacc/install
	# 拷贝系统配置、初始化脚本等
	$(CP) ./root/* $(1)/
	
	# 关键：检查是否存在 htdocs 目录并拷贝到 www 路径
	if [ -d ./htdocs ]; then \
		$(INSTALL_DIR) $(1)/www/luci-static/resources/view/turboacc; \
		$(CP) ./htdocs/luci-static/resources/view/turboacc/* $(1)/www/luci-static/resources/view/turboacc/; \
	fi

	# 设置脚本权限
	[ -f $(1)/etc/init.d/turboacc ] && chmod 755 $(1)/etc/init.d/turboacc
	[ -f $(1)/etc/uci-defaults/turboacc ] && chmod 755 $(1)/etc/uci-defaults/turboacc
endef

# 核心：必须有这一行，否则 make dump 会找不到目标
$(eval $(call BuildPackage,luci-app-turboacc))

