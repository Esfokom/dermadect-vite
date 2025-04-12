import Blob "mo:base/Blob";
import Cycles "mo:base/ExperimentalCycles";
import Nat64 "mo:base/Nat64";
import Text "mo:base/Text";
import IC "ic:aaaaa-aa";

actor {
  public query func greet(name : Text) : async Text {
    return "Hello, " # name # "!";
  };

  public query func transform({
    context : Blob;
    response : IC.http_request_result;
  }) : async IC.http_request_result {
    {
      response with headers = []; // not intersted in the headers
    };
  };

  // Public method to send POST request to Gemini API
  public func predictImage(base64_image : Text) : async Text {

    // let url = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=AIzaSyDBKxQ-mCZqmFPHpUwIlKIFouTQ3RUoFxo";
    let url = "https://dermadect-fast-api.vercel.app/predict_base64";
    // 2. Request headers
    let request_headers = [{ name = "Content-Type"; value = "application/json" }];

    // 3. Request body JSON (escaped properly)
    let request_body_json : Text = "{ \"data\": \"" # base64_image # "\" }";

    let request_body = Text.encodeUtf8(request_body_json);

    // 4. HTTP request payload
    let http_request : IC.http_request_args = {
      url = url;
      max_response_bytes = null;
      headers = request_headers;
      body = ?request_body;
      method = #post;
      transform = ?{
        function = transform;
        context = Blob.fromArray([]);
      };
    };
    // 5. Add cycles (adjust as needed based on response size)
    Cycles.add<system>(230_850_258_000);

    // 6. Perform HTTP POST request
    let http_response : IC.http_request_result = await IC.http_request(http_request);

    // 7. Decode the response Blob into Text
    let decoded_text : Text = switch (Text.decodeUtf8(http_response.body)) {
      case (null) { "No value returned" };
      case (?text) { text };
    };

    decoded_text;
  };

  public func geminiRequest(_disease : Text) : async Text {

    let url = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=AIzaSyDBKxQ-mCZqmFPHpUwIlKIFouTQ3RUoFxo";

    // 2. Request headers
    let request_headers = [{ name = "Content-Type"; value = "application/json" }];
    let gemini_query : Text = "Provide a professional and medically accurate explanation of " # _disease # ". Include:
1. A brief description of the condition
2. Causes and risk factors
3. Common symptoms
4. Diagnosis and testing methods
5. Treatment options (medications, therapies, etc.)
6. Prevention tips
7. When to see a dermatologist
Write in a format suitable for a medical reference app.
";
    // 3. Request body JSON (escaped properly)
    let request_body_json : Text = "{ \"contents\": [ { \"parts\": [ { \"text\": \"" # gemini_query # "\" } ] } ] }";

    let request_body = Text.encodeUtf8(request_body_json);

    // 4. HTTP request payload
    let http_request : IC.http_request_args = {
      url = url;
      max_response_bytes = null;
      headers = request_headers;
      body = ?request_body;
      method = #post;
      transform = ?{
        function = transform;
        context = Blob.fromArray([]);
      };
    };

    // 5. Add cycles (adjust as needed based on response size)
    Cycles.add<system>(230_850_258_000);

    // 6. Perform HTTP POST request
    let http_response : IC.http_request_result = await IC.http_request(http_request);

    // 7. Decode the response Blob into Text
    let decoded_text : Text = switch (Text.decodeUtf8(http_response.body)) {
      case (null) { "No value returned" };
      case (?text) { text };
    };

    decoded_text;
  };

};
