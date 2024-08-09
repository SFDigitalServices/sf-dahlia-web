module CookieJar
  # workaround for error in EventSubscriberTranslateService
  # https://github.com/restforce/restforce/issues/120#issuecomment-625676182
  module CookieValidation
    def self.hostname_reach(hostname)
      host = to_domain hostname
      host = host.downcase
      match = BASE_HOSTNAME.match host

      return unless match

      match[1] if PublicSuffix.valid?(match[1]) || match[1] == 'local'
    end

    def self.compute_search_domains_for_host(host)
      host = effective_host host
      result = [host]

      return result if IPADDR.match?(host)

      loop do
        result << ".#{host}"
        host = hostname_reach(host)
        break unless host
      end

      result
    end
  end
end
