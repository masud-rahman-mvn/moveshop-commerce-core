import React from "react"
import { LineItem, OrderItemChange, ProductVariant } from "@medusajs/medusa"
import {
  useAdminDeleteOrderEditItemChange,
  useAdminOrderEditAddLineItem,
  useAdminOrderEditDeleteLineItem,
  useAdminOrderEditUpdateLineItem,
} from "medusa-react"
import clsx from "clsx"
import { useTranslation } from "react-i18next"

import ImagePlaceholder from "../../../../components/fundamentals/image-placeholder"
import { formatAmountWithSymbol } from "../../../../utils/prices"
import PlusIcon from "../../../../components/fundamentals/icons/plus-icon"
import MinusIcon from "../../../../components/fundamentals/icons/minus-icon"
import Actionables from "../../../../components/molecules/ms-actionables"
import TrashIcon from "../../../../components/fundamentals/icons/trash-icon"
import DuplicateIcon from "../../../../components/fundamentals/icons/duplicate-icon"
import RefreshIcon from "../../../../components/fundamentals/icons/refresh-icon"
import useNotification from "../../../../hooks/use-notification"
import { LayeredModalContext } from "../../../../components/molecules/modal/layered-modal"
import { AddProductVariant } from "../../edit/modal"
import Tooltip from "../../../../components/atoms/tooltip"
import CopyToClipboard from "../../../../components/atoms/copy-to-clipboard"

type OrderEditLineProps = {
  item?: LineItem
  customerId?: string
  regionId?: string
  currencyCode?: string
  change?: OrderItemChange
}

let isLoading = false

const OrderEditLine = ({
  item,
  currencyCode,
  change,
  customerId,
  regionId,
}: OrderEditLineProps) => {
  const { t } = useTranslation()
  const notification = useNotification()
  const { pop, push } = React.useContext(LayeredModalContext)

  const isNew = change?.type === "item_add"
  const isModified = change?.type === "item_update"
  const isLocked = !!item?.fulfilled_quantity

  const { mutateAsync: addLineItem } = useAdminOrderEditAddLineItem(
    item.order_edit_id!
  )

  const { mutateAsync: removeItem } = useAdminOrderEditDeleteLineItem(
    item.order_edit_id!,
    item.id
  )

  const { mutateAsync: updateItem } = useAdminOrderEditUpdateLineItem(
    item.order_edit_id!,
    item.id
  )

  const { mutateAsync: undoChange } = useAdminDeleteOrderEditItemChange(
    item.order_edit_id!,
    change?.id as string
  )

  const onQuantityUpdate = async (newQuantity: number) => {
    if (isLoading) {
      return
    }

    isLoading = true
    try {
      await updateItem({ quantity: newQuantity })
    } finally {
      isLoading = false
    }
  }

  const onDuplicate = async () => {
    if (!item.variant) {
      notification(
        t("order-line-warning", "Warning"),
        t(
          "order-line-cannot-duplicate-an-item-without-a-variant",
          "Cannot duplicate an item without a variant"
        ),
        "warning"
      )
      return
    }

    try {
      await addLineItem({
        variant_id: item.variant_id,
        quantity: item.quantity,
      })
    } catch (e) {
      notification(
        t("order-line-error", "Error"),
        t("order-line-failed-to-duplicate-item", "Failed to duplicate item"),
        "error"
      )
    }
  }

  const onRemove = async () => {
    try {
      if (change) {
        if (change.type === "item_add") {
          await undoChange()
        }
        if (change.type === "item_update") {
          await undoChange()
          await removeItem()
        }
      } else {
        await removeItem()
      }
      notification(
        t("order-line-success", "Success"),
        t("order-line-item-removed", "Item removed"),
        "success"
      )
    } catch (e) {
      notification(
        t("order-line-error", "Error"),
        t("order-line-failed-to-remove-item", "Failed to remove item"),
        "error"
      )
    }
  }

  const onReplace = async (selected: ProductVariant[]) => {
    const newVariantId = selected[0].id
    try {
      await onRemove()
      await addLineItem({ variant_id: newVariantId, quantity: item.quantity })
      notification(
        t("order-line-success", "Success"),
        t("order-line-item-added", "Item added"),
        "success"
      )
    } catch (e) {
      notification(
        t("order-line-error", "Error"),
        t(
          "order-line-failed-to-replace-the-item",
          "Failed to replace the item"
        ),
        "error"
      )
    }
  }

  const replaceProductVariantScreen = {
    title: t("order-line-replace-product-variants", "Replace Product Variants"),
    onBack: pop,
    view: (
      <AddProductVariant
        onSubmit={onReplace}
        customerId={customerId}
        regionId={regionId}
        currencyCode={currencyCode}
        isReplace
      />
    ),
  }

  const actions = [
    !isLocked && {
      label: t("order-line-replace-with-other-item", "Replace with other item"),
      onClick: () => push(replaceProductVariantScreen),
      icon: <RefreshIcon size="20" />,
    },

    {
      label: t("order-line-duplicate-item", "Duplicate item"),
      onClick: onDuplicate,
      icon: <DuplicateIcon size="20" />,
    },
    !isLocked && {
      label: t("order-line-remove-item", "Remove item"),
      onClick: onRemove,
      variant: "danger",
      icon: <TrashIcon size="20" />,
    },
  ].filter(Boolean)

  return (
    <Tooltip
      content={"three dot"}
      side="top"
      open={isLocked ? undefined : false}
    >
      <>
        <Actionables forceDropdown actions={actions} />
      </>
    </Tooltip>
  )
}

export default OrderEditLine
