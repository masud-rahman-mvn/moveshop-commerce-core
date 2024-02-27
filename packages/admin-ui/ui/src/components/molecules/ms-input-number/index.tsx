import React, {
  ChangeEventHandler,
  FocusEventHandler,
  MouseEventHandler,
  useImperativeHandle,
  useRef,
} from "react"

import clsx from "clsx"

import { TriangleDownMini, TriangleUpMini } from "@medusajs/icons"
import { InputHeaderProps } from "../../fundamentals/input-header"

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

const QuantityCell = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      small,
      quantity,
      placeholder,
      label,
      name,
      required,
      deletable,
      onDelete,
      onChange,
      onFocus,
      tooltipContent,
      tooltip,
      prefix,
      suffix,
      errors,
      props,
      className,
      ...fieldProps
    }: InputProps,
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null)

    useImperativeHandle<HTMLInputElement | null, HTMLInputElement | null>(
      ref,
      () => inputRef.current
    )

    const onNumberIncrement = () => {
      inputRef.current?.stepUp()
      if (onChange) {
        inputRef.current?.dispatchEvent(
          new InputEvent("change", {
            view: window,
            bubbles: true,
            cancelable: false,
          })
        )
      }
    }

    const onNumberDecrement = () => {
      inputRef.current?.stepDown()
      if (onChange) {
        inputRef.current?.dispatchEvent(
          new InputEvent("change", {
            view: window,
            bubbles: true,
            cancelable: false,
          })
        )
      }
    }

    return (
      <div
        className={clsx("w-20 rounded-lg border px-3 py-0.5", className)}
        {...props}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-large">{quantity}</p>
          <div className="flex  flex-col items-center self-end">
            <button
              onClick={onNumberIncrement}
              className="text-grey-50 text-large hover:bg-grey-10 focus:bg-grey-20 rounded-soft  cursor-pointer outline-none"
              type="button"
            >
              <TriangleUpMini />
            </button>

            <button
              onClick={onNumberDecrement}
              className="text-grey-50 text-large hover:bg-grey-10 focus:bg-grey-20 rounded-soft   cursor-pointer outline-none"
              type="button"
            >
              <TriangleDownMini />
            </button>
          </div>
        </div>
      </div>
    )
  }
)

QuantityCell.displayName = "QuantityCell"

export default QuantityCell
