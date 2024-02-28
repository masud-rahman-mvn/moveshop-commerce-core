import clsx from "clsx"

import { useTranslation } from "react-i18next"

import ImagePlaceholder from "../../../../components/fundamentals/image-placeholder"

import Table from "../../../../components/molecules/ms-table"
import { Order, OrderEdit } from "@medusajs/medusa"
import OrderEditLine from "../order-line/edit"
import { fieldsItems } from "./data/fieldsItem"
import { item } from "./data/item"
import { ProductVariant } from "@medusajs/client-types"
import { useContext, useEffect, useRef, useState } from "react"
import {
  useAdminCreateOrderEdit,
  useAdminDeleteOrderEdit,
  useAdminOrderEditAddLineItem,
  useAdminRequestOrderEditConfirmation,
  useAdminUpdateOrderEdit,
} from "medusa-react"
import useNotification from "../../../../hooks/use-notification"
import QuantityCell from "../../../../components/molecules/ms-quantity-cell"
import { OrderEditContext } from "../../edit/context"
import { LayeredModalContext } from "../../../../components/molecules/modal/layered-modal"

type OrderEditModalProps = {
  close: () => void
  orderEdit: OrderEdit
  currencyCode: string
  regionId: string
  customerId: string
  currentSubtotal: number
  paidTotal: number
  refundedTotal: number
}

const OrderEditTable = (props: OrderEditModalProps) => {
  const {
    close,
    currentSubtotal,
    orderEdit,
    currencyCode,
    regionId,
    customerId,
    paidTotal,
    refundedTotal,
  } = props

  const { t } = useTranslation()

  const filterRef = useRef()
  const notification = useNotification()
  const [note, setNote] = useState<string | undefined>()
  const [showFilter, setShowFilter] = useState(false)
  const [filterTerm, setFilterTerm] = useState<string>("")

  const showTotals = currentSubtotal !== orderEdit.subtotal
  const hasChanges = !!orderEdit.changes.length

  const {
    mutateAsync: requestConfirmation,
    isLoading: isRequestingConfirmation,
  } = useAdminRequestOrderEditConfirmation(orderEdit.id)

  const { mutateAsync: updateOrderEdit, isLoading: isUpdating } =
    useAdminUpdateOrderEdit(orderEdit.id)

  const { mutateAsync: deleteOrderEdit } = useAdminDeleteOrderEdit(orderEdit.id)

  const { mutateAsync: addLineItem } = useAdminOrderEditAddLineItem(
    orderEdit.id
  )

  const layeredModalContext = useContext(LayeredModalContext)

  const onSave = async () => {
    try {
      await requestConfirmation()
      if (note) {
        await updateOrderEdit({ internal_note: note })
      }

      notification(
        t("edit-success", "Success"),
        t("edit-order-edit-set-as-requested", "Order edit set as requested"),
        "success"
      )
    } catch (e) {
      notification(
        t("edit-error", "Error"),
        t(
          "edit-failed-to-request-confirmation",
          "Failed to request confirmation"
        ),
        "error"
      )
    }
    close()
  }

  const onCancel = async () => {
    // NOTE: has to be this order of ops
    await deleteOrderEdit()
    close()
  }

  useEffect(() => {
    if (showFilter) {
      filterRef.current.focus()
    }
  }, [showFilter])

  const onAddVariants = async (selectedVariants: ProductVariant[]) => {
    try {
      const promises = selectedVariants.map((v) =>
        addLineItem({ variant_id: v.id, quantity: 1 })
      )

      await Promise.all(promises)

      notification(
        t("edit-success", "Success"),
        t("edit-added-successfully", "Added successfully"),
        "success"
      )
    } catch (e) {
      notification(
        t("edit-error", "Error"),
        t("edit-error-occurred", "Error occurred"),
        "error"
      )
    }
  }

  const hideFilter = () => {
    if (showFilter) {
      setFilterTerm("")
    }
    setShowFilter((s) => !s)
  }

  let displayItems = orderEdit.items.sort(
    // @ts-ignore
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  )

  if (filterTerm) {
    displayItems = displayItems.filter(
      (i) =>
        i.title.toLowerCase().includes(filterTerm) ||
        i.variant?.sku.toLowerCase().includes(filterTerm)
    )
  }

  // const addProductVariantScreen = {
  //   title: t("edit-add-product-variants", "Add Product Variants"),
  //   onBack: layeredModalContext.pop,
  //   view: (
  //     <AddProductVariant
  //       onSubmit={onAddVariants}
  //       customerId={customerId}
  //       regionId={regionId}
  //       currencyCode={currencyCode}
  //     />
  //   ),
  // }

  return (
    <div className="mt-6 rounded-lg border ">
      {true && (
        <Table className=" m-3">
          <Table.Head>
            <Table.HeadRow>
              <Table.HeadCell>
                {t("components-item-name", "Item Name")}
              </Table.HeadCell>
              <Table.HeadCell className=" text-center ">
                {t("components-item-price", "Item Price")}
              </Table.HeadCell>
              <Table.HeadCell></Table.HeadCell>
              <Table.HeadCell className=" text-center ">
                {t("components-quantity", "Quantity")}
              </Table.HeadCell>
              <Table.HeadCell className="text-center ">
                {t("components-total-price", "Total Price")}
              </Table.HeadCell>
            </Table.HeadRow>
          </Table.Head>
          <div className="h-3"></div>
          <Table.Body className="">
            {displayItems?.map((oi, index) => {
              return (
                <Table.Row
                  key={item.id}
                  className={clsx("border-b-grey-0 hover:bg-grey-0")}
                >
                  <Table.Cell>
                    <div className="flex  items-center py-2">
                      <div className="h-[40px] w-[30px] ">
                        {oi.thumbnail ? (
                          <img
                            className="h-full w-full rounded object-cover"
                            src={oi.thumbnail}
                          />
                        ) : (
                          <ImagePlaceholder />
                        )}
                      </div>
                      <div className="inter-small-regular text-grey-50 ml-4 flex flex-col">
                        {oi.title && (
                          <span className="text-grey-90">{oi.title}</span>
                        )}
                        <span>{oi.title}</span>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="text-center ">
                    <div className="flex items-center justify-center gap-3">
                      <div className="flex items-center gap-3">
                        <span>{currencyCode.toLocaleUpperCase()}</span>
                        <span>{oi?.unit_price}</span>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="text-large text-start  text-black ">
                    X
                  </Table.Cell>
                  <Table.Cell className="flex flex-col items-center text-center ">
                    <QuantityCell quantity={oi?.quantity} />
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center justify-center gap-3 ">
                      <div className="flex items-center gap-3">
                        <span>{currencyCode.toLocaleUpperCase()}</span>
                        <span>{oi?.total}</span>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <OrderEditLine
                      key={oi.id}
                      item={oi}
                      customerId={customerId}
                      regionId={regionId}
                      currencyCode={currencyCode}
                      change={orderEdit.changes.find(
                        (change) =>
                          change.line_item_id === oi.id ||
                          change.original_line_item_id === oi.id
                      )}
                    />
                  </Table.Cell>
                </Table.Row>
              )
            })}
          </Table.Body>
        </Table>
      )}
    </div>
  )
}

export default OrderEditTable
