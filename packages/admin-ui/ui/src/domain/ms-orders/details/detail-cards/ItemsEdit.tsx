import clsx from "clsx"

import { useTranslation } from "react-i18next"

import ImagePlaceholder from "../../../../components/fundamentals/image-placeholder"

import QuantityCell from "../../../../components/molecules/ms-input-number"
import Table from "../../../../components/molecules/ms-table"
import { Order } from "@medusajs/medusa"
import OrderEditLine from "../order-line/edit"
import { fieldsItems } from "./data/fieldsItem"
import { item } from "./data/item"
import { ProductVariant } from "@medusajs/client-types"
import { useEffect, useRef, useState } from "react"
import {
  useAdminDeleteOrderEdit,
  useAdminOrderEditAddLineItem,
  useAdminRequestOrderEditConfirmation,
  useAdminUpdateOrderEdit,
} from "medusa-react"
import useNotification from "../../../../hooks/use-notification"

type SummaryCardProps = {
  order?: Order
}
const ItemsEdit = (props: SummaryCardProps) => {
  const { order } = props
  const { t } = useTranslation()

  const filterRef = useRef()
  const notification = useNotification()
  const [note, setNote] = useState<string | undefined>()
  const [showFilter, setShowFilter] = useState(false)
  const [filterTerm, setFilterTerm] = useState<string>("")
  const [isUpdate, setIsUpdate] = useState(true)
  const {
    mutateAsync: requestConfirmation,
    isLoading: isRequestingConfirmation,
  } = useAdminRequestOrderEditConfirmation(item.id)

  const { mutateAsync: updateOrderEdit, isLoading: isUpdating } =
    useAdminUpdateOrderEdit(item.id)

  const { mutateAsync: deleteOrderEdit } = useAdminDeleteOrderEdit(item.id)

  const { mutateAsync: addLineItem } = useAdminOrderEditAddLineItem(item.id)

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

  return (
    <div className="rounded-lg border ">
      {true && (
        <Table className=" m-3">
          <Table.Head className=" ">
            <Table.HeadRow className="text-small rounded-lg  font-bold text-black ">
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
            {fieldsItems?.map((item, index) => {
              return (
                <Table.Row
                  key={item.id}
                  className={clsx("border-b-grey-0 hover:bg-grey-0")}
                >
                  <Table.Cell>
                    <div className="flex min-w-[240px] items-center py-2">
                      <div className="h-[40px] w-[30px] ">
                        {item.thumbnail ? (
                          <img
                            className="h-full w-full rounded object-cover"
                            src={item.thumbnail}
                          />
                        ) : (
                          <ImagePlaceholder />
                        )}
                      </div>
                      <div className="inter-small-regular text-grey-50 ml-4 flex flex-col">
                        {item.product_title && (
                          <span className="text-grey-90">
                            {item.product_title}
                          </span>
                        )}
                        <span>{item.title}</span>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="w-32  text-center ">
                    <span>{item.unit_price}</span>
                  </Table.Cell>
                  <Table.Cell className="text-large text-start  text-black ">
                    X
                  </Table.Cell>
                  <Table.Cell className="flex flex-col items-center text-center ">
                    <QuantityCell quantity={item?.quantity} />
                    {/* {isUpdate ? (
                      <QuantityCell quantity={item?.quantity} />
                    ) : (
                      <p className="text-large">{item?.quantity}</p>
                    )} */}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center justify-center gap-3">
                      <div className="flex items-center gap-3">
                        <span>{order?.currency_code.toLocaleUpperCase()}</span>
                        <span>{order?.total}</span>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <OrderEditLine
                      currencyCode="USD"
                      customerId={order?.customer_id}
                      item={item}
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

export default ItemsEdit
