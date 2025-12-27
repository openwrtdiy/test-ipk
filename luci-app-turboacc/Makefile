include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-turboacc
PKG_VERSION:=beta
PKG_RELEASE:=1

include $(INCLUDE_DIR)/package.mk

define Package/luci-app-turboacc
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=3. Applications
  TITLE:=LuCI support for Flow Offloading (Native)
  DEPENDS:=+firewall4 +kmod-nft-offload +kmod-tcp-bbr +kmod-nft-fullcone
  PKGARCH:=all
endef

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

define Build/Compile
endef

define Package/luci-app-turboacc/install
	$(CP) ./root/* $(1)/
	if [ -d ./htdocs ]; then \
		$(INSTALL_DIR) $(1)/www/luci-static/resources/view/turboacc; \
		$(CP) ./htdocs/luci-static/resources/view/turboacc/* $(1)/www/luci-static/resources/view/turboacc/; \
	fi
	[ -f $(1)/etc/init.d/turboacc ] && chmod 755 $(1)/etc/init.d/turboacc
	[ -f $(1)/etc/uci-defaults/turboacc ] && chmod 755 $(1)/etc/uci-defaults/turboacc
endef

$(eval $(call BuildPackage,luci-app-turboacc))
