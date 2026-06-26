from app.parser import parse_receipt


def test_parses_common_nfce_markup():
    html = """
    <html><body>
      <div id="u20">Mercado Cajui LTDA</div>
      <div>CNPJ: 12.345.678/0001-90</div>
      <table id="tabResult">
        <tr>
          <td><span class="txtTit">CAFÉ 500G</span></td>
          <td><span class="Rqtd">Qtd.: 2</span></td>
          <td><span class="RUN">UN</span></td>
          <td><span class="RvlUnit">Vl. Unit.: 10,50</span></td>
          <td><span class="valor">21,00</span></td>
        </tr>
      </table>
      <div>Valor total: 21,00</div>
      <div>Emissão: 20/06/2026 14:30:00</div>
    </body></html>
    """
    receipt = parse_receipt(html, "https://sefaz.example/receipt")
    assert receipt.merchantName == "Mercado Cajui LTDA"
    assert receipt.totalAmount == 21
    assert receipt.items[0].description == "CAFÉ 500G"
    assert receipt.items[0].quantity == 2
