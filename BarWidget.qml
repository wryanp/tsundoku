import QtQuick
import QtQuick.Controls
import Quickshell
import qs.Ui
import qs.Commons

BarWidget {
  id: root
  moduleName: "william.tsundoku"

  readonly property var service: bar?.shell?.serviceFor("william.tsundoku")
  readonly property var items: service ? service.items : []
  readonly property int unreadCount: service ? service.unreadCount : 0

  property bool popupOpen: false
  property string filter: "all"

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
    if (root.service.addUrl(addField.text)) addField.text = ""
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
          readonly property string caption: it.author ? (it.provider + " · " + it.author) : it.provider

          width: ListView.view.width
          height: rowContent.implicitHeight + Style.space(10)
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

            Text {
              text: itemRow.kindGlyph
              color: root.bar.foreground
              font.family: root.bar.fontFamily
              font.pixelSize: Style.font.body
              width: Style.space(18)
              horizontalAlignment: Text.AlignHCenter
              anchors.verticalCenter: parent.verticalCenter
            }

            Column {
              width: parent.width - Style.space(26) - actions.width - Style.space(8)
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
