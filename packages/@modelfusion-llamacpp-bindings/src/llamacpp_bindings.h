#pragma once

#include <napi.h>

class llamacppBindings : public Napi::ObjectWrap<llamacppBindings>
{
public:
    llamacppBindings(const Napi::CallbackInfo &);
    Napi::Value Greet(const Napi::CallbackInfo &);

    static Napi::Function GetClass(Napi::Env);

private:
    std::string _greeterName;
};
