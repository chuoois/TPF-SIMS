import React from 'react';

/**
 * Component PrintableInvoice
 * Standardized invoice template for TPF-SIMS (Trọng Phóng Branding)
 *
 * This component is intended for print use only (inline styles for window.print compatibility)
 */

// ===================== HELPERS =====================
const fmtCurrency = (n) =>
  n != null
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(n)
    : "—";

const fmtDate = (s) => (s ? new Date(s).toLocaleDateString("vi-VN") : "");

function readNumberVN(num) {
  if (!num) return "";
  const units = ["", "nghìn", "triệu", "tỷ"];
  const words = [
    "không",
    "một",
    "hai",
    "ba",
    "bốn",
    "năm",
    "sáu",
    "bảy",
    "tám",
    "chín",
  ];
  let result = "";
  let str = String(num);
  let unitIdx = 0;
  while (str.length > 0) {
    let block = parseInt(str.slice(-3), 10);
    str = str.slice(0, -3);
    if (block > 0 || (unitIdx === 0 && num === 0)) {
      let blockStr = "";
      let h = Math.floor(block / 100);
      let t = Math.floor((block % 100) / 10);
      let u = block % 10;
      if (h > 0 || str.length > 0) blockStr += words[h] + " trăm ";
      if (t > 1) blockStr += words[t] + " mươi ";
      else if (t === 1) blockStr += "mười ";
      else if (t === 0 && u > 0 && (h > 0 || str.length > 0))
        blockStr += "linh ";
      if (u === 1 && t > 1) blockStr += "mốt ";
      else if (u === 5 && t > 0) blockStr += "lăm ";
      else if (u > 0) blockStr += words[u] + " ";
      result = blockStr + units[unitIdx] + " " + result;
    }
    unitIdx++;
  }
  result = result.replace(/\s+/g, " ").trim();
  return result.charAt(0).toUpperCase() + result.slice(1) + " đồng";
}

// ===================== COMPONENT =====================
export const PrintableInvoice = ({ o, displayTotal }) => {
  const today = new Date();
  const printDate = `Ngày ${today.getDate()} tháng ${
    today.getMonth() + 1
  } năm ${today.getFullYear()}`;

  return (
    <div
      style={{
        fontFamily: "'Times New Roman', serif",
        color: "#000",
        padding: "20px 0",
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 26,
            fontWeight: "bold",
            marginBottom: 4,
            textTransform: "uppercase",
            color: "#d32f2f",
          }}
        >
          ĐỒ GỖ MỸ NGHỆ
        </h1>
        <h2
          style={{
            fontSize: 36,
            fontFamily: "'Dancing Script', 'Brush Script MT', cursive, serif",
            color: "#d32f2f",
            margin: "4px 0 8px 0",
            fontWeight: "normal",
          }}
        >
          Trọng Phóng
        </h2>
        <p style={{ fontSize: 16, color: "#d32f2f", margin: "4px 0" }}>
          NHẬN ĐẶT HÀNG THEO YÊU CẦU
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 13,
            color: "#d32f2f",
            fontWeight: "bold",
            margin: "8px 0 0 0",
          }}
        >
          <span>ĐC: CHỢ BƯƠNG - CẤN HỮU - QUỐC OAI - HÀ NỘI</span>
          <span>ĐT: 0988.113.995</span>
        </div>
        <div
          style={{ borderBottom: "1px solid #d32f2f", margin: "10px 0 16px" }}
        />
        <h2
          style={{
            fontSize: 22,
            fontWeight: "bold",
            marginBottom: 16,
            color: "#d32f2f",
          }}
        >
          HOÁ ĐƠN BÁN HÀNG
        </h2>
      </div>

      {/* Customer info */}
      <div style={{ marginBottom: 20 }}>
        <div
          style={{ display: "flex", alignItems: "flex-end", marginBottom: 12 }}
        >
          <span
            style={{
              fontSize: 13,
              color: "#d32f2f",
              marginRight: 8,
              whiteSpace: "nowrap",
            }}
          >
            TÊN KHÁCH HÀNG:
          </span>
          <span
            style={{
              flex: 1,
              borderBottom: "1px dotted #d32f2f",
              fontSize: 16,
              color: "blue",
              fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
            }}
          >
            {o.customer?.name}
          </span>
        </div>
        <div
          style={{ display: "flex", alignItems: "flex-end", marginBottom: 12 }}
        >
          <span
            style={{
              fontSize: 13,
              color: "#d32f2f",
              marginRight: 8,
              whiteSpace: "nowrap",
            }}
          >
            ĐỊA CHỈ:
          </span>
          <span
            style={{
              flex: 1,
              borderBottom: "1px dotted #d32f2f",
              fontSize: 16,
              color: "blue",
              fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
              minHeight: 22,
            }}
          >
            {o.customer?.address}
          </span>
        </div>
        <div
          style={{ display: "flex", alignItems: "flex-end", marginBottom: 12 }}
        >
          <span
            style={{
              fontSize: 13,
              color: "#d32f2f",
              marginRight: 8,
              whiteSpace: "nowrap",
            }}
          >
            NGÀY GIAO:
          </span>
          <span
            style={{
              flex: 1,
              borderBottom: "1px dotted #d32f2f",
              fontSize: 16,
              color: "blue",
              fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
              minHeight: 22,
            }}
          >
            {fmtDate(o.deliveryDate)}
          </span>
        </div>
      </div>

      {/* Products table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 14,
          marginBottom: 20,
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                border: "1px solid #d32f2f",
                padding: "8px 6px",
                textAlign: "center",
                width: 40,
                color: "#d32f2f",
                fontWeight: "normal",
              }}
            >
              SỐ TT
            </th>
            <th
              style={{
                border: "1px solid #d32f2f",
                padding: "8px 6px",
                textAlign: "center",
                color: "#d32f2f",
                fontWeight: "normal",
              }}
            >
              TÊN MẶT HÀNG
            </th>
            <th
              style={{
                border: "1px solid #d32f2f",
                padding: "8px 6px",
                textAlign: "center",
                width: 80,
                color: "#d32f2f",
                fontWeight: "normal",
              }}
            >
              SỐ LƯỢNG
            </th>
            <th
              style={{
                border: "1px solid #d32f2f",
                padding: "8px 6px",
                textAlign: "center",
                width: 70,
                color: "#d32f2f",
                fontWeight: "normal",
              }}
            >
              BẢO HÀNH
            </th>
            <th
              style={{
                border: "1px solid #d32f2f",
                padding: "8px 6px",
                textAlign: "center",
                width: 110,
                color: "#d32f2f",
                fontWeight: "normal",
              }}
            >
              ĐƠN GIÁ
            </th>
            <th
              style={{
                border: "1px solid #d32f2f",
                padding: "8px 6px",
                textAlign: "center",
                width: 140,
                color: "#d32f2f",
                fontWeight: "normal",
              }}
            >
              THÀNH TIỀN
            </th>
          </tr>
        </thead>
        <tbody>
          {(o.products || []).map((p, i) => (
            <tr key={i}>
              <td
                style={{
                  border: "1px solid #d32f2f",
                  padding: "6px",
                  textAlign: "center",
                  color: "blue",
                  fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
                  fontSize: 16,
                }}
              >
                {i + 1}
              </td>
              <td
                style={{
                  border: "1px solid #d32f2f",
                  padding: "6px",
                  color: "blue",
                  fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
                  fontSize: 16,
                }}
              >
                {p.name}
                {p.note && (
                  <div
                    style={{ fontSize: 13, fontStyle: "italic", color: "blue" }}
                  >
                    * {p.note}
                  </div>
                )}
              </td>
              <td
                style={{
                  border: "1px solid #d32f2f",
                  padding: "6px",
                  textAlign: "center",
                  color: "blue",
                  fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
                  fontSize: 16,
                }}
              >
                {p.qty}
              </td>
              <td
                style={{
                  border: "1px solid #d32f2f",
                  padding: "6px",
                  textAlign: "center",
                  color: "blue",
                  fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
                  fontSize: 16,
                }}
              >
                {p.warranty || "—"}
              </td>
              <td
                style={{
                  border: "1px solid #d32f2f",
                  padding: "6px",
                  textAlign: "right",
                  color: "blue",
                  fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
                  fontSize: 16,
                }}
              >
                {p.price ? fmtCurrency(p.price) : "—"}
              </td>
              <td
                style={{
                  border: "1px solid #d32f2f",
                  padding: "6px",
                  textAlign: "right",
                  color: "blue",
                  fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
                  fontSize: 16,
                }}
              >
                {p.price ? fmtCurrency(p.price * p.qty) : "—"}
              </td>
            </tr>
          ))}
          {/* Fill empty rows to make it look like a real receipt pad */}
          {Array.from({ length: Math.max(0, 5 - (o.products?.length || 0)) }).map(
            (_, i) => (
              <tr key={"empty-" + i}>
                <td
                  style={{ border: "1px solid #d32f2f", padding: "14px 6px" }}
                ></td>
                <td
                  style={{ border: "1px solid #d32f2f", padding: "14px 6px" }}
                ></td>
                <td
                  style={{ border: "1px solid #d32f2f", padding: "14px 6px" }}
                ></td>
                <td
                  style={{ border: "1px solid #d32f2f", padding: "14px 6px" }}
                ></td>
                <td
                  style={{ border: "1px solid #d32f2f", padding: "14px 6px" }}
                ></td>
                <td
                  style={{ border: "1px solid #d32f2f", padding: "14px 6px" }}
                ></td>
              </tr>
            )
          )}
          {/* Breakdown Rows */}

          {o.discount > 0 && (
            <tr>
              <td
                colSpan={5}
                style={{
                  border: "1px solid #d32f2f",
                  padding: "6px 8px",
                  textAlign: "right",
                  color: "#d32f2f",
                  fontSize: 13,
                }}
              >
                CHIẾT KHẤU:
              </td>
              <td
                style={{
                  border: "1px solid #d32f2f",
                  padding: "6px 8px",
                  textAlign: "right",
                  color: "blue",
                  fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
                  fontSize: 16,
                }}
              >
                - {fmtCurrency(o.discount)}
              </td>
            </tr>
          )}
          <tr>
            <td
              colSpan={5}
              style={{
                border: "1px solid #d32f2f",
                padding: "6px 8px",
                textAlign: "right",
                color: "#d32f2f",
                fontWeight: "bold",
                fontSize: 14,
              }}
            >
              TỔNG THANH TOÁN
            </td>
            <td
              style={{
                border: "1px solid #d32f2f",
                padding: "6px 8px",
                textAlign: "right",
                color: "blue",
                fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              {fmtCurrency(displayTotal)}
            </td>
          </tr>
          {o.deposit > 0 && (
            <tr>
              <td
                colSpan={5}
                style={{
                  border: "1px solid #d32f2f",
                  padding: "6px 8px",
                  textAlign: "right",
                  color: "#d32f2f",
                  fontSize: 13,
                }}
              >
                 ĐẶT CỌC:
              </td>
              <td
                style={{
                  border: "1px solid #d32f2f",
                  padding: "6px 8px",
                  textAlign: "right",
                  color: "blue",
                  fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
                  fontSize: 16,
                }}
              >
                {fmtCurrency(o.deposit)}
              </td>
            </tr>
          )}
          {o.deposit > 0 && (
            <tr>
              <td
                colSpan={5}
                style={{
                  border: "1px solid #d32f2f",
                  padding: "6px 8px",
                  textAlign: "right",
                  color: "#d32f2f",
                  fontWeight: "bold",
                  fontSize: 14,
                }}
              >
                CÒN LẠI PHẢI THANH TOÁN
              </td>
              <td
                style={{
                  border: "1px solid #d32f2f",
                  padding: "6px 8px",
                  textAlign: "right",
                  color: "blue",
                  fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
                  fontSize: 18,
                  fontWeight: "bold",
                }}
              >
                {fmtCurrency(displayTotal - (o.deposit || 0))}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals in words */}
      <div
        style={{ display: "flex", alignItems: "flex-start", marginBottom: 20 }}
      >
        <span
          style={{
            fontSize: 13,
            color: "#d32f2f",
            marginRight: 8,
            whiteSpace: "nowrap",
            textTransform: "uppercase",
          }}
        >
          {o.deposit > 0 ? "CÒN LẠI BẰNG CHỮ:" : "THÀNH TIỀN BẰNG CHỮ:"}
        </span>
        <span
          style={{
            flex: 1,
            borderBottom: "1px dotted #d32f2f",
            fontSize: 16,
            color: "blue",
            fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
          }}
        >
          {readNumberVN(displayTotal - (o.deposit || 0))}
        </span>
      </div>

      {/* Notes */}
      {o.notes && (
        <div
          style={{
            marginBottom: 20,
            fontSize: 13,
            fontStyle: "italic",
            color: "#555",
          }}
        >
          <strong style={{ color: "#d32f2f" }}>Ghi chú:</strong> {o.notes}
        </div>
      )}

      {/* Signatures */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 40,
          fontSize: 14,
          textAlign: "center",
        }}
      >
        <div style={{ width: "40%" }}>
          <p style={{ color: "#d32f2f", marginBottom: 30 }}>
            Khách hàng ký nhận
          </p>
        </div>
        <div style={{ width: "40%" }}>
          <p style={{ color: "#d32f2f", marginBottom: 4, fontStyle: "italic" }}>
            {printDate}
          </p>
          <p style={{ color: "#d32f2f", marginBottom: 30 }}>Chủ cửa hàng</p>
          <p
            style={{
              fontFamily: "'Caveat', 'Dancing Script', cursive, serif",
              fontSize: 18,
              color: "blue",
            }}
          >
            Nguyễn Trọng Phóng
          </p>
        </div>
      </div>
    </div>
  );
};
