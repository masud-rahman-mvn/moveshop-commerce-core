import React, {
  ChangeEventHandler,
  FocusEventHandler,
  MouseEventHandler,
} from "react"

import clsx from "clsx"
import { LineItem, OrderItemChange, ProductVariant } from "@medusajs/medusa"
import { TriangleDownMini, TriangleUpMini } from "@medusajs/icons"
import { InputHeaderProps } from "../../../fundamentals/input-header"
import {
  useAdminDeleteOrderEditItemChange,
  useAdminOrderEditAddLineItem,
  useAdminOrderEditDeleteLineItem,
  useAdminOrderEditUpdateLineItem,
} from "medusa-react"
import { clx } from "../../../../utils/clx"

export type InputProps = Omit<React.ComponentPropsWithRef<"input">, "prefix"> &
  InputHeaderProps & {
    small?: boolean
    label?: string
    quantity?: string | number
    deletable?: boolean
    onDelete?: MouseEventHandler<HTMLSpanElement>
    onChange?: ChangeEventHandler<HTMLInputElement>
    onFocus?: FocusEventHandler<HTMLInputElement>
    errors?: { [x: string]: unknown }
    prefix?: React.ReactNode
    suffix?: React.ReactNode
    props?: React.HTMLAttributes<HTMLDivElement>
  }

type OrderEditLineProps = {
  item: LineItem
  customerId?: string
  regionId?: string
  currencyCode: string
  change?: OrderItemChange
  className?: string
}

let isLoading = false

const QuantityCell = ({
  item,
  currencyCode,
  change,
  customerId,
  regionId,
  className,
}: OrderEditLineProps) => {
  const isNew = change?.type === "item_add"
  const isModified = change?.type === "item_update"
  const isLocked = !!item?.fulfilled_quantity

  const { mutateAsync: addLineItem } = useAdminOrderEditAddLineItem(
    item?.order_edit_id!
  )

  const { mutateAsync: removeItem } = useAdminOrderEditDeleteLineItem(
    item?.order_edit_id!,
    item?.id
  )

  const { mutateAsync: updateItem } = useAdminOrderEditUpdateLineItem(
    item?.order_edit_id!,
    item?.id
  )

  const { mutateAsync: undoChange } = useAdminDeleteOrderEditItemChange(
    item?.order_edit_id!,
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

  return (
    <div className={clsx("w-20 rounded-lg border px-3 py-0.5", className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-large">{item.quantity}</p>
        <div className="flex  flex-col items-center self-end">
          <button
            onClick={() => onQuantityUpdate(item.quantity + 1)}
            className={clx(
              "text-grey-50 text-large hover:bg-grey-10 focus:bg-grey-20 rounded-soft  cursor-pointer outline-none",
              {
                "pointer-events-none": isLoading,
              }
            )}
            type="button"
          >
            <TriangleUpMini />
          </button>

          <button
            onClick={() =>
              item.quantity > 1 &&
              !isLocked &&
              onQuantityUpdate(item.quantity - 1)
            }
            className={clx(
              "text-grey-50 text-large hover:bg-grey-10 focus:bg-grey-20 rounded-soft  cursor-pointer outline-none",
              {
                "pointer-events-none": isLoading,
              }
            )}
            type="button"
          >
            <TriangleDownMini />
          </button>
        </div>
      </div>
    </div>
  )
}

QuantityCell.displayName = "QuantityCell"

export default QuantityCell
