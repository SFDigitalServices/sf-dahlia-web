class Api::V1::EmailController < ApiController
  # TODO: controller vs service
  def confirmation
    token = params[:t]

    begin
      # TODO: sometimes rails complains it cant find JWT
      # TODO: split token and pass to salesforce
      # TODO: move secret to env variable
      # TODO: tracking, monitoring, and logging activity
      resp = JWT.decode(
        token,
        '123',
      )
      b, a, r, s = resp[0].values_at('b', 'a', 'r', 's')
      puts 'B & S'
      puts b, s

      header = { 'Content-Type' => 'application/json' }
      body = build_request_body(r, a, s)

      results = Force::Request.new(parse_response: true)
                              .post_with_headers("/fieldUpdateComment/#{a}", body, header)

      # TODO: redirect
      render json: results
    rescue StandardError => e
      # TODO: error handling, including expired token page
      puts 'error'
      puts e
      e
    end
  end

  private

  def confirmation_params
    params.require(:t)
  end

  def listing_id_map(listing_number)
    const array = ['', 'a0W4U00000KnLRMUA3', 'a0W4U00000IYEb4UAH', 'a0W4U00000IYSM4UAP',
                   'a0W4U00000Ih1V2UAJ', 'a0W4U00000KnCZRUA3']
    array[listing_number]
  end

  # TODO: linting around a param name
  def build_request_body(token_resp, a, s)
    # TODO: convert date format and add to comment
    puts s
    puts convet_date_format(s)
    formatted_date = convet_date_format(s)

    case token_resp
    when 'y'
      [{ 'Processing_Status__c': 'Processing',
         'Processing_Comment__c': "MOHCD automated interest email sent on #{formatted_date}. Applicant responded Yes.",
         'Application__c': a }]
    when 'n'
      [{ 'Processing_Status__c': 'Withdrawn',
         'Processing_Comment__c': "MOHCD automated interest email sent on #{formatted_date}. Applicant responded No.",
         'Application__c': a,
         'Sub_Status__c': 'Written withdrawal' }]
    else
      # TODO: what to do in this case?
      []
    end
  end

  def convet_date_format(date)
    date = Date.parse(date)
    date.strftime('%B %d, %Y')
  end
end
