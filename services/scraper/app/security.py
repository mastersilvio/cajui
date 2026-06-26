import ipaddress
import socket
from urllib.parse import urlparse


def ensure_public_url(url: str) -> None:
    parsed = urlparse(url)
    if parsed.scheme != "https" or not parsed.hostname:
        raise ValueError("O cupom precisa ter uma URL HTTPS válida.")

    try:
        addresses = socket.getaddrinfo(parsed.hostname, 443, type=socket.SOCK_STREAM)
    except socket.gaierror as error:
        raise ValueError("Não foi possível localizar o endereço do cupom.") from error

    for address in addresses:
        ip = ipaddress.ip_address(address[4][0])
        if not ip.is_global:
            raise ValueError("O endereço do cupom não é público.")
