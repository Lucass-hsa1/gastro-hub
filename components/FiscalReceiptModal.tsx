'use client'

import { motion } from 'framer-motion'
import { X, Printer, Download, CheckCircle2, XCircle, Mail, MessageCircle, FileText } from 'lucide-react'
import { useStore } from '@/lib/store'
import type { FiscalReceipt } from '@/lib/types'

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatKey(k: string) {
  return k.match(/.{1,4}/g)?.join(' ') || k
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' })
}

const paymentLabels = {
  cash: 'Dinheiro', credit: 'Cartão Crédito', debit: 'Cartão Débito',
  pix: 'PIX', voucher: 'Vale-refeição',
} as const

interface Props {
  receipt: FiscalReceipt
  onClose: () => void
  onCancel?: () => void
}

export default function FiscalReceiptModal({ receipt, onClose, onCancel }: Props) {
  const restaurant = useStore(s => s.restaurant)

  const qrUrl = `https://www.fazenda.sp.gov.br/nfce/qrcode?p=${receipt.accessKey}`
  const qrImg = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}`

  const isCanceled = receipt.status === 'cancelada'

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-md max-h-[95vh] flex flex-col overflow-hidden shadow-2xl my-auto"
      >
        {/* Header */}
        <div className={`p-4 flex items-center justify-between text-white ${
          isCanceled ? 'bg-gradient-to-r from-red-600 to-rose-700' : 'bg-gradient-to-r from-teal-700 to-emerald-700'
        }`}>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <div>
              <p className="text-xs opacity-90 uppercase font-bold">{receipt.docType}</p>
              <p className="font-bold">Nº {receipt.number.toString().padStart(9, '0')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cupom (área imprimível) */}
        <div className="overflow-y-auto flex-1 print-area">
          <div className="bg-white p-5 font-mono text-[11px] leading-tight text-gray-800">
            {/* Status */}
            {isCanceled ? (
              <div className="bg-red-50 border-2 border-red-300 rounded p-2 text-center mb-3">
                <p className="text-red-700 font-bold text-sm">CUPOM CANCELADO</p>
                {receipt.canceledAt && <p className="text-[10px] text-red-600">{formatDate(receipt.canceledAt)}</p>}
                {receipt.cancelReason && <p className="text-[10px] text-red-600 mt-1">{receipt.cancelReason}</p>}
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded p-2 flex items-center justify-center gap-1 mb-3">
                <CheckCircle2 className="w-3 h-3 text-green-700" />
                <p className="text-green-700 font-bold text-[10px]">AUTORIZADA — uso da SEFAZ</p>
              </div>
            )}

            {/* Cabeçalho restaurante */}
            <div className="text-center border-b border-dashed border-gray-300 pb-2 mb-2">
              <p className="font-bold text-xs uppercase">{restaurant.name}</p>
              <p>{restaurant.address}</p>
              <p>CNPJ: {restaurant.cnpj}</p>
              <p>IE: 123.456.789.012</p>
            </div>

            <p className="text-center font-bold text-[10px] mb-2">
              CUPOM FISCAL ELETRÔNICO — NFC-e
            </p>

            {/* Itens */}
            <div className="border-y border-dashed border-gray-300 py-2 mb-2">
              <div className="flex justify-between font-bold text-[10px] mb-1">
                <span>ITEM/CÓD</span>
                <span>VL TOTAL</span>
              </div>
              {receipt.items.map((it, idx) => (
                <div key={idx} className="mb-1">
                  <div className="flex justify-between">
                    <span className="truncate flex-1">{(idx + 1).toString().padStart(3, '0')} {it.name}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-600 pl-2">
                    <span>{it.quantity} UN x {formatBRL(it.price)}</span>
                    <span className="font-bold text-gray-800">{formatBRL(it.total)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totais */}
            <div className="space-y-0.5 pb-2 border-b border-dashed border-gray-300 mb-2">
              <div className="flex justify-between"><span>Qtd. itens:</span><span>{receipt.items.length}</span></div>
              <div className="flex justify-between"><span>Subtotal:</span><span>{formatBRL(receipt.subtotal)}</span></div>
              {receipt.discount > 0 && (
                <div className="flex justify-between text-red-600"><span>Desconto:</span><span>-{formatBRL(receipt.discount)}</span></div>
              )}
              <div className="flex justify-between font-bold text-sm pt-1">
                <span>TOTAL R$:</span>
                <span>{formatBRL(receipt.total)}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span>{paymentLabels[receipt.paymentMethod]}:</span>
                <span>{formatBRL(receipt.total)}</span>
              </div>
              <div className="flex justify-between text-[10px] italic text-gray-600 pt-1">
                <span>Trib. aprox. (Lei 12.741/12):</span>
                <span>{formatBRL(receipt.taxApprox)}</span>
              </div>
            </div>

            {/* Cliente */}
            {receipt.customerName && (
              <div className="pb-2 border-b border-dashed border-gray-300 mb-2">
                <p className="font-bold text-[10px]">CONSUMIDOR</p>
                <p>{receipt.customerName}</p>
                {receipt.customerDoc && <p>{receipt.customerDoc}</p>}
              </div>
            )}

            {/* QR + Chave */}
            <div className="text-center mb-2">
              <p className="font-bold text-[10px] mb-1">Consulte pela chave de acesso em:</p>
              <p className="text-[9px] text-gray-600 mb-2">www.fazenda.sp.gov.br/nfce</p>
              <img src={qrImg} alt="QR" className="w-32 h-32 mx-auto" />
              <p className="font-mono text-[9px] mt-2 break-all leading-tight">{formatKey(receipt.accessKey)}</p>
            </div>

            {/* Protocolo */}
            <div className="text-center text-[10px] border-t border-dashed border-gray-300 pt-2">
              <p>Protocolo de autorização:</p>
              <p className="font-bold">{receipt.protocol}</p>
              <p className="mt-1">Emitido em: {formatDate(receipt.issuedAt)}</p>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="border-t border-gray-100 p-3 bg-gray-50 grid grid-cols-2 gap-2 no-print">
          <button
            onClick={() => window.print()}
            className="py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:border-teal-400"
          >
            <Printer className="w-3 h-3" /> Imprimir
          </button>
          <button
            onClick={() => alert('Demo: cupom enviado via WhatsApp')}
            className="py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:border-teal-400"
          >
            <MessageCircle className="w-3 h-3" /> WhatsApp
          </button>
          <button
            onClick={() => alert('Demo: cupom enviado por e-mail')}
            className="py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:border-teal-400"
          >
            <Mail className="w-3 h-3" /> E-mail
          </button>
          {!isCanceled && onCancel ? (
            <button
              onClick={onCancel}
              className="py-2 bg-red-50 border border-red-300 text-red-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-red-100"
            >
              <XCircle className="w-3 h-3" /> Cancelar NFC-e
            </button>
          ) : (
            <button
              onClick={() => alert('Demo: PDF gerado')}
              className="py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:border-teal-400"
            >
              <Download className="w-3 h-3" /> PDF
            </button>
          )}
        </div>
      </motion.div>

      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>
    </motion.div>
  )
}
