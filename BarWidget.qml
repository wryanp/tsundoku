import QtQuick
import QtQuick.Controls
import QtQuick.Effects
import Quickshell
import qs.Ui
import qs.Commons
import "Providers.js" as Providers

BarWidget {
  id: root
  moduleName: "william.tsundoku"

  readonly property var service: bar?.shell?.serviceFor("william.tsundoku")
  readonly property var items: service ? service.items : []
  readonly property int unreadCount: service ? service.unreadCount : 0

  // Scanned once here rather than per-delegate.
  readonly property var providerEntries: Providers.all()

  function providerEntryFor(providerId) {
    if (!providerId) return null
    for (var i = 0; i < root.providerEntries.length; i++) {
      if (root.providerEntries[i].id === providerId) return root.providerEntries[i]
    }
    return null
  }

  property bool popupOpen: false
  property string filter: "all"

  // Inline feedback for the add field: "" when clean, otherwise a short
  // human message for the invalid/duplicate cases.
  property string addError: ""

  // Reset feedback on open/close, and focus the add field on open so the
  // popup is paste-ready without a click.
  onPopupOpenChanged: {
    root.addError = ""
    if (root.popupOpen) addField.forceActiveFocus()
  }

  // open/close/opened form the bar host's summon contract, so
  // `omarchy-shell shell toggle william.tsundoku` can drive the popup
  // from a Hyprland keybinding without a separate panel kind.
  readonly property bool opened: popupOpen
  function open() { popupOpen = true }
  function close() { popupOpen = false }

  readonly property var filteredItems: {
    var list = root.items
    if (root.filter === "done") return list.filter(function(it) { return !!it.consumedAt })
    if (root.filter === "all") return list.filter(function(it) { return !it.consumedAt })
    return list.filter(function(it) { return !it.consumedAt && it.kind === root.filter })
  }

  function tryAdd() {
    if (!root.service) return
    if (addField.text.trim() === "") return
    var result = root.service.addUrl(addField.text)
    if (result === "ok") {
      addField.text = ""
      root.addError = ""
    } else if (result === "duplicate") {
      root.addError = "Already in your pile"
    } else {
      root.addError = "Not a link — paste a full URL"
    }
  }

  visible: true
  implicitWidth: row.implicitWidth + Style.space(14)
  implicitHeight: barSize

  Row {
    id: row
    anchors.centerIn: parent
    spacing: Style.space(4)

    Text {
      id: glyph
      anchors.verticalCenter: parent.verticalCenter
      text: "󱉟"
      color: root.unreadCount > 0 ? root.bar.barForeground : Qt.darker(root.bar.barForeground, 1.5)
      font.family: root.bar.fontFamily
      font.pixelSize: Style.font.body
      Behavior on color {
        enabled: !root.bar || root.bar.foregroundAnimationEnabled
        ColorAnimation { duration: 160 }
      }
    }

    Text {
      id: badge
      visible: root.unreadCount > 0
      anchors.verticalCenter: parent.verticalCenter
      text: String(root.unreadCount)
      color: root.bar.barForeground
      font.family: root.bar.fontFamily
      font.pixelSize: Style.font.caption
      font.bold: true
    }
  }

  MouseArea {
    anchors.fill: parent
    hoverEnabled: true
    cursorShape: Qt.PointingHandCursor
    acceptedButtons: Qt.LeftButton

    onClicked: root.popupOpen = !root.popupOpen
    onEntered: if (root.bar) root.bar.showTooltip(root, "Tsundoku — " + root.unreadCount + " unread")
    onExited: if (root.bar) root.bar.hideTooltip(root)
  }

  PopupCard {
    id: popup
    anchorItem: root
    bar: root.bar
    owner: root
    open: root.popupOpen
    contentWidth: popup.fittedContentWidth(Style.space(360))
    contentHeight: popup.fittedContentHeight(column.implicitHeight, Style.space(480))

    Column {
      id: column
      anchors.fill: parent
      spacing: Style.space(10)

      Row {
        width: parent.width
        spacing: Style.space(8)

        TextField {
          id: addField
          width: parent.width - addButton.width - Style.space(8)
          placeholderText: "Paste a URL…"
          foreground: root.bar.foreground
          onAccepted: root.tryAdd()
          onTextChanged: root.addError = ""
        }

        Button {
          id: addButton
          iconText: "󰐕"
          foreground: root.bar.foreground
          bordered: true
          horizontalPadding: Style.spacing.controlPaddingX
          verticalPadding: Style.spacing.controlPaddingY
          onClicked: root.tryAdd()
        }
      }

      Text {
        visible: root.addError !== ""
        width: parent.width
        text: root.addError
        color: Color.urgent
        font.family: root.bar.fontFamily
        font.pixelSize: Style.font.caption
        elide: Text.ElideRight
      }

      Row {
        width: parent.width
        spacing: Style.space(4)

        Repeater {
          model: [
            { key: "all", label: "All" },
            { key: "watch", label: "Watch" },
            { key: "listen", label: "Listen" },
            { key: "read", label: "Read" },
            { key: "done", label: "Done" }
          ]

          Button {
            required property var modelData
            text: modelData.label
            foreground: root.bar.foreground
            selected: root.filter === modelData.key
            horizontalPadding: Style.spacing.controlPaddingX
            verticalPadding: Style.spacing.xs
            fontSize: Style.font.bodySmall
            onClicked: root.filter = modelData.key
          }
        }
      }

      PanelSeparator {
        foreground: root.bar.foreground
      }

      ListView {
        id: itemList
        width: parent.width
        height: Math.min(contentHeight, Style.space(360))
        visible: root.filteredItems.length > 0
        spacing: Style.space(4)
        clip: true
        boundsBehavior: Flickable.StopAtBounds
        interactive: contentHeight > height

        ScrollBar.vertical: ScrollBar { policy: ScrollBar.AsNeeded }

        model: root.filteredItems

        delegate: BorderSurface {
          id: itemRow
          required property var modelData

          readonly property var it: modelData
          readonly property bool done: !!it.consumedAt
          readonly property string kindGlyph: it.kind === "watch" ? "󰕧" : it.kind === "listen" ? "󰋋" : "󰈙"
          readonly property var providerEntry: root.providerEntryFor(it.provider)
          readonly property string providerLabel: providerEntry ? providerEntry.displayName : it.provider
          readonly property string caption: it.author ? (providerLabel + " · " + it.author) : providerLabel

          width: ListView.view.width
          // Fixed regardless of thumbnail presence, so rows don't jiggle
          // in height as async thumbnails/logos pop in.
          height: Style.space(48)
          radius: Style.spacing.labelGap
          color: rowHover.hovered ? Style.hoverFillFor(root.bar.foreground, Color.accent) : "transparent"
          borderSpec: Border.none()

          Row {
            id: rowContent
            anchors.left: parent.left
            anchors.right: parent.right
            anchors.verticalCenter: parent.verticalCenter
            anchors.leftMargin: itemRow.borderLeft + Style.space(8)
            anchors.rightMargin: itemRow.borderRight + Style.space(8)
            spacing: Style.space(8)

            // Leading visual: thumbnail > tinted provider logo > kind glyph,
            // in that priority order (#9/#10). A fixed thumbnail-shaped slot
            // keeps row height stable whichever candidate ends up showing.
            Item {
              id: leadingSlot
              width: Style.space(44)
              height: Style.space(28)
              anchors.verticalCenter: parent.verticalCenter

              readonly property bool hasThumb: !!itemRow.it.thumbnailPath
              readonly property bool thumbVisible: hasThumb && thumbImage.status === Image.Ready
              readonly property bool logoVisible: !hasThumb && !!itemRow.providerEntry && logoImage.status === Image.Ready

              // Hidden rounded-rect mask, sampled as a texture by the clip
              // effect below — not rendered itself.
              Rectangle {
                id: thumbMask
                anchors.fill: parent
                radius: Style.spacing.labelGap
                visible: false
                layer.enabled: true
              }

              Item {
                id: thumbClip
                anchors.fill: parent
                visible: leadingSlot.thumbVisible
                layer.enabled: true
                layer.smooth: true
                layer.effect: MultiEffect {
                  maskEnabled: true
                  maskSource: thumbMask
                }

                Image {
                  id: thumbImage
                  anchors.fill: parent
                  source: leadingSlot.hasThumb ? "file://" + itemRow.it.thumbnailPath : ""
                  asynchronous: true
                  fillMode: Image.PreserveAspectCrop
                  sourceSize.width: Math.round(leadingSlot.width * Screen.devicePixelRatio)
                  sourceSize.height: Math.round(leadingSlot.height * Screen.devicePixelRatio)
                }
              }

              // Tinted provider logo — hidden source Image sampled by
              // MultiEffect's colorization, same idiom as the shell's own
              // tray icon recoloring (Tray.qml TrayIcon).
              Image {
                id: logoImage
                anchors.fill: parent
                anchors.margins: Style.space(4)
                visible: false
                layer.enabled: true
                asynchronous: true
                fillMode: Image.PreserveAspectFit
                source: (!leadingSlot.hasThumb && itemRow.providerEntry) ? Qt.resolvedUrl(itemRow.providerEntry.logoAsset) : ""
              }

              MultiEffect {
                anchors.fill: logoImage
                source: logoImage
                visible: leadingSlot.logoVisible
                colorization: 1.0
                colorizationColor: root.bar.foreground
              }

              // Fallback: shown whenever neither the thumbnail nor the
              // tinted logo is actually on screen yet (including while
              // either is still loading), so there's never a blank slot.
              Text {
                anchors.centerIn: parent
                visible: !leadingSlot.thumbVisible && !leadingSlot.logoVisible
                text: itemRow.kindGlyph
                color: root.bar.foreground
                font.family: root.bar.fontFamily
                font.pixelSize: Style.font.body
              }
            }

            Column {
              width: parent.width - leadingSlot.width - rowContent.spacing - actions.width - Style.space(8)
              spacing: Style.space(1)
              anchors.verticalCenter: parent.verticalCenter

              Text {
                text: itemRow.it.title
                color: root.bar.foreground
                font.family: root.bar.fontFamily
                font.pixelSize: Style.font.bodySmall
                font.bold: true
                elide: Text.ElideRight
                width: parent.width
              }

              Text {
                text: itemRow.caption
                color: Qt.darker(root.bar.foreground, 1.5)
                font.family: root.bar.fontFamily
                font.pixelSize: Style.font.caption
                elide: Text.ElideRight
                width: parent.width
                visible: text !== ""
              }
            }

            Row {
              id: actions
              spacing: Style.space(2)
              anchors.verticalCenter: parent.verticalCenter

              Button {
                iconText: "󰏌"
                foreground: root.bar.foreground
                iconSize: Style.font.bodySmall
                horizontalPadding: Style.spacing.xs
                verticalPadding: Style.spacing.xs
                onClicked: {
                  if (root.service) root.service.openItem(itemRow.it.id)
                  root.close()
                }
              }

              Button {
                iconText: itemRow.done ? "󰕌" : "󰄬"
                foreground: root.bar.foreground
                iconSize: Style.font.bodySmall
                horizontalPadding: Style.spacing.xs
                verticalPadding: Style.spacing.xs
                onClicked: {
                  if (!root.service) return
                  if (itemRow.done) root.service.unmarkConsumed(itemRow.it.id)
                  else root.service.markConsumed(itemRow.it.id)
                }
              }

              Button {
                iconText: "󰩺"
                foreground: root.bar.foreground
                iconSize: Style.font.bodySmall
                horizontalPadding: Style.spacing.xs
                verticalPadding: Style.spacing.xs
                onClicked: if (root.service) root.service.removeItem(itemRow.it.id)
              }

              // Retry (#8/#11): only surfaces once a resolve has actually
              // failed. Deliberately no affordance for "pending" — a quiet
              // in-flight state, not one that needs the user's attention.
              Button {
                visible: itemRow.it.resolveState === "failed"
                iconText: "󰑐"
                foreground: root.bar.foreground
                iconSize: Style.font.bodySmall
                horizontalPadding: Style.spacing.xs
                verticalPadding: Style.spacing.xs
                onClicked: if (root.service) root.service.resolveItem(itemRow.it.id)
              }
            }
          }

          MouseArea {
            id: rowHover
            anchors.fill: parent
            anchors.rightMargin: actions.width + Style.space(8)
            hoverEnabled: true
            cursorShape: Qt.PointingHandCursor
            property bool hovered: containsMouse
            onClicked: {
              if (root.service) root.service.openItem(itemRow.it.id)
              root.close()
            }
          }
        }
      }

      Text {
        visible: root.filteredItems.length === 0
        width: parent.width
        horizontalAlignment: Text.AlignHCenter
        text: "Nothing piled up yet — add a link above."
        color: Qt.darker(root.bar.foreground, 1.5)
        font.family: root.bar.fontFamily
        font.pixelSize: Style.font.bodySmall
        wrapMode: Text.WordWrap
      }
    }
  }
}
