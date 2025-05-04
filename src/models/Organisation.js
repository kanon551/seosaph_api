    const mongoose = require('mongoose');
    const { Schema } = mongoose;

    const EmailDetailsSchema = new Schema({
        name: { type: String, default: null },
        email: { type: String, default: null }
    }, { _id: false });
    
    const MobileDetailsSchema = new Schema({
        name: { type: String, default: null },
        number: { type: String, default: null }
    }, { _id: false });

    const IpInfoSchema = new Schema({
        ip: { type: String, required: true },
        network: { type: String, required: true },
        version: { type: String, required: true, enum: ["IPv4", "IPv6"] },
        city: { type: String, default: null },
        region: { type: String, default: null },
        region_code: { type: String, default: null },
        country: { type: String, required: true },
        country_name: { type: String, required: true },
        country_code: { type: String, required: true },
        country_code_iso3: { type: String, default: null },
        country_capital: { type: String, default: null },
        country_tld: { type: String, default: null },
        continent_code: { type: String, required: true },
        in_eu: { type: Boolean, required: true },
        postal: { type: String, default: null },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        timezone: { type: String, required: true },
        utc_offset: { type: String, default: null },
        country_calling_code: { type: String, required: true },
        currency: { type: String, required: true },
        currency_name: { type: String, required: true },
        languages: { type: String, required: true },
        country_area: { type: Number, default: null },
        country_population: { type: Number, default: null },
        asn: { type: String, default: null },
        org: { type: String, default: null }
      }, { _id: false });

    const OrganisationSchema = new mongoose.Schema({
        _id: {
            type: String,
            unique: true,
            required: true,
        },
        orgId: { type: String, required: true },
        token: { type: String, required: true },
        authToken: { type: String, required: true },
        authTokenExpiry: { type: Number, required: true },
        timestamp: { type: Date, required: true },
        timezone: { type: String, required: true },
        email: { type: EmailDetailsSchema, required: true },
        mobile: { type: MobileDetailsSchema, required: true },
        waNumber: { type: String, default: null },
        waName: { type: String, default: null },
        ipInfo: { type: IpInfoSchema, default: undefined },
        created_time: {type: Date, default: Date.now},
    }, {
        versionKey: false,
    });

    module.exports = {OrganisationSchema};

