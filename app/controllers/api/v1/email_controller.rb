class Api::V1::EmailController < ApiController
  def confirmation
    token = params[:token]
    begin
      # puts 'decoding...'
      resp = JWT.decode(
        token,
        '123',
      )
      puts resp
    rescue StandardError => e
      puts 'error'
      puts e
      return e
    end
    render json: { hello: resp }
  end

  private

  def confirmation_params
    params.require(:token)
  end
end
