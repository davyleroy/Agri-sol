from flask import Flask, request, jsonify
from flask_restx import Api, Resource, fields, reqparse
import os
import logging
from datetime import datetime, timedelta
from supabase import create_client, Client
from typing import Dict, List, Optional
import json

# Configure logging
logger = logging.getLogger(__name__)

# Supabase configuration
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://placeholder.supabase.co')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY', 'placeholder-key')

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# API Models for documentation
scan_history_model = {
    'id': fields.String(description='Unique scan ID'),
    'user_id': fields.String(description='User ID who performed the scan'),
    'crop_type': fields.String(description='Type of crop scanned'),
    'predicted_disease': fields.String(description='Predicted disease name'),
    'confidence_score': fields.Float(description='Confidence score (0-100)'),
    'severity': fields.String(description='Disease severity level'),
    'treatment_urgency': fields.String(description='Treatment urgency level'),
    'location_string': fields.String(description='Full location string'),
    'country': fields.String(description='Country name'),
    'province': fields.String(description='Province/State name'),
    'district': fields.String(description='District name'),
    'sector': fields.String(description='Sector name'),
    'latitude': fields.Float(description='GPS latitude'),
    'longitude': fields.Float(description='GPS longitude'),
    'created_at': fields.DateTime(description='When the scan was created'),
}

location_analytics_model = {
    'location_string': fields.String(description='Full location string'),
    'country': fields.String(description='Country name'),
    'province': fields.String(description='Province name'),
    'district': fields.String(description='District name'),
    'total_scans': fields.Integer(description='Total number of scans'),
    'total_users': fields.Integer(description='Total number of users'),
    'healthy_scans': fields.Integer(description='Number of healthy scans'),
    'disease_scans': fields.Integer(description='Number of disease scans'),
    'healthy_percentage': fields.Float(description='Percentage of healthy scans'),
    'growth_rate_7_days': fields.Float(description='Growth rate in last 7 days'),
    'last_scan_at': fields.DateTime(description='When the last scan was performed'),
    'most_common_disease': fields.String(description='Most common disease in this location'),
    'most_common_crop': fields.String(description='Most common crop in this location'),
}

class LocationAPI:
    """Class to handle location-related API endpoints"""
    
    def __init__(self, api: Api):
        self.api = api
        self.setup_routes()
    
    def setup_routes(self):
        """Setup all location-related routes"""
        
        # Add models to API documentation
        self.api.model('ScanHistory', scan_history_model)
        self.api.model('LocationAnalytics', location_analytics_model)
        
        # Register routes
        self.api.add_resource(
            type('SaveScanHistory', (Resource,), {
                'post': self.save_scan_history,
                '__doc__': 'Save a new scan with location data'
            }),
            '/api/location/scan-history'
        )
        
        self.api.add_resource(
            type('GetLocationLeaderboard', (Resource,), {
                'get': self.get_location_leaderboard,
                '__doc__': 'Get location leaderboard data'
            }),
            '/api/location/leaderboard'
        )
        
        self.api.add_resource(
            type('GetUserScanHistory', (Resource,), {
                'get': self.get_user_scan_history,
                '__doc__': 'Get scan history for a specific user'
            }),
            '/api/location/user-scans/<string:user_id>'
        )
        
        self.api.add_resource(
            type('GetLocationAnalytics', (Resource,), {
                'get': self.get_location_analytics,
                '__doc__': 'Get detailed analytics for a specific location'
            }),
            '/api/location/analytics/<string:location_string>'
        )
        
        self.api.add_resource(
            type('SaveUserLocation', (Resource,), {
                'post': self.save_user_location,
                '__doc__': 'Save or update user location'
            }),
            '/api/location/user-location'
        )
        
        self.api.add_resource(
            type('GetDiseaseTracking', (Resource,), {
                'get': self.get_disease_tracking,
                '__doc__': 'Get disease tracking data by location'
            }),
            '/api/location/disease-tracking'
        )
    
    def save_scan_history(self):
        """Save a new scan with location data"""
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = [
                'user_id', 'crop_type', 'predicted_disease', 'confidence_score',
                'severity', 'treatment_urgency', 'country', 'location_string'
            ]
            
            for field in required_fields:
                if field not in data:
                    return {'error': f'Missing required field: {field}'}, 400
            
            # Build location string if not provided
            if 'location_string' not in data:
                location_parts = []
                if data.get('sector'):
                    location_parts.append(data['sector'])
                if data.get('district'):
                    location_parts.append(data['district'])
                if data.get('province'):
                    location_parts.append(data['province'])
                if data.get('country'):
                    location_parts.append(data['country'])
                data['location_string'] = ', '.join(location_parts)
            
            # Insert scan history
            result = supabase.table('scan_history').insert({
                'user_id': data['user_id'],
                'crop_type': data['crop_type'],
                'predicted_disease': data['predicted_disease'],
                'confidence_score': float(data['confidence_score']),
                'severity': data['severity'],
                'treatment_urgency': data['treatment_urgency'],
                'country': data['country'],
                'province': data.get('province'),
                'district': data.get('district'),
                'sector': data.get('sector'),
                'location_string': data['location_string'],
                'latitude': data.get('latitude'),
                'longitude': data.get('longitude'),
                'image_path': data.get('image_path'),
                'image_size_bytes': data.get('image_size_bytes'),
            }).execute()
            
            if result.data:
                logger.info(f"Scan history saved successfully: {result.data[0]['id']}")
                return {
                    'success': True,
                    'message': 'Scan history saved successfully',
                    'scan_id': result.data[0]['id']
                }, 201
            else:
                logger.error("Failed to save scan history")
                return {'error': 'Failed to save scan history'}, 500
                
        except Exception as e:
            logger.error(f"Error saving scan history: {str(e)}")
            return {'error': f'Failed to save scan history: {str(e)}'}, 500
    
    def get_location_leaderboard(self):
        """Get location leaderboard data"""
        try:
            # Get query parameters
            sort_by = request.args.get('sort_by', 'total_scans')
            limit = int(request.args.get('limit', 50))
            
            # Validate sort_by parameter
            valid_sorts = ['total_scans', 'total_users', 'growth_rate']
            if sort_by not in valid_sorts:
                sort_by = 'total_scans'
            
            # Call the database function
            result = supabase.rpc('get_location_leaderboard', {
                'sort_by': sort_by,
                'limit_count': limit
            }).execute()
            
            if result.data:
                logger.info(f"Retrieved {len(result.data)} locations for leaderboard")
                return {
                    'success': True,
                    'data': result.data,
                    'total_locations': len(result.data),
                    'sorted_by': sort_by
                }, 200
            else:
                return {
                    'success': True,
                    'data': [],
                    'total_locations': 0,
                    'message': 'No location data found'
                }, 200
                
        except Exception as e:
            logger.error(f"Error getting location leaderboard: {str(e)}")
            return {'error': f'Failed to get location leaderboard: {str(e)}'}, 500
    
    def get_user_scan_history(self, user_id: str):
        """Get scan history for a specific user"""
        try:
            # Get query parameters
            limit = int(request.args.get('limit', 100))
            offset = int(request.args.get('offset', 0))
            
            # Get user scan history
            result = supabase.table('scan_history').select(
                'id, crop_type, predicted_disease, confidence_score, severity, '
                'treatment_urgency, location_string, country, province, district, '
                'sector, latitude, longitude, created_at'
            ).eq('user_id', user_id).order('created_at', desc=True).limit(limit).offset(offset).execute()
            
            if result.data:
                logger.info(f"Retrieved {len(result.data)} scan records for user {user_id}")
                return {
                    'success': True,
                    'data': result.data,
                    'user_id': user_id,
                    'total_scans': len(result.data)
                }, 200
            else:
                return {
                    'success': True,
                    'data': [],
                    'user_id': user_id,
                    'total_scans': 0,
                    'message': 'No scan history found for this user'
                }, 200
                
        except Exception as e:
            logger.error(f"Error getting user scan history: {str(e)}")
            return {'error': f'Failed to get user scan history: {str(e)}'}, 500
    
    def get_location_analytics(self, location_string: str):
        """Get detailed analytics for a specific location"""
        try:
            # Get location analytics
            result = supabase.table('location_analytics').select('*').eq(
                'location_string', location_string
            ).execute()
            
            if result.data:
                location_data = result.data[0]
                
                # Get recent scans for this location
                recent_scans = supabase.table('scan_history').select(
                    'crop_type, predicted_disease, confidence_score, created_at'
                ).eq('location_string', location_string).order(
                    'created_at', desc=True
                ).limit(10).execute()
                
                # Get disease breakdown
                disease_breakdown = supabase.table('disease_tracking').select(
                    'disease_name, crop_type, total_cases, cases_last_7_days, cases_last_30_days'
                ).eq('location_string', location_string).execute()
                
                return {
                    'success': True,
                    'location_data': location_data,
                    'recent_scans': recent_scans.data or [],
                    'disease_breakdown': disease_breakdown.data or []
                }, 200
            else:
                return {
                    'success': False,
                    'message': 'Location not found'
                }, 404
                
        except Exception as e:
            logger.error(f"Error getting location analytics: {str(e)}")
            return {'error': f'Failed to get location analytics: {str(e)}'}, 500
    
    def save_user_location(self):
        """Save or update user location"""
        try:
            data = request.get_json()
            
            # Validate required fields
            required_fields = ['user_id', 'country', 'location_string']
            for field in required_fields:
                if field not in data:
                    return {'error': f'Missing required field: {field}'}, 400
            
            # Check if user already has a location
            existing = supabase.table('user_locations').select('*').eq(
                'user_id', data['user_id']
            ).execute()
            
            if existing.data:
                # Update existing location
                result = supabase.table('user_locations').update({
                    'country': data['country'],
                    'province': data.get('province'),
                    'district': data.get('district'),
                    'sector': data.get('sector'),
                    'location_string': data['location_string'],
                    'latitude': data.get('latitude'),
                    'longitude': data.get('longitude'),
                    'is_primary': data.get('is_primary', True),
                    'updated_at': datetime.utcnow().isoformat()
                }).eq('user_id', data['user_id']).execute()
            else:
                # Insert new location
                result = supabase.table('user_locations').insert({
                    'user_id': data['user_id'],
                    'country': data['country'],
                    'province': data.get('province'),
                    'district': data.get('district'),
                    'sector': data.get('sector'),
                    'location_string': data['location_string'],
                    'latitude': data.get('latitude'),
                    'longitude': data.get('longitude'),
                    'is_primary': data.get('is_primary', True),
                }).execute()
            
            if result.data:
                return {
                    'success': True,
                    'message': 'User location saved successfully',
                    'location_id': result.data[0]['id']
                }, 201
            else:
                return {'error': 'Failed to save user location'}, 500
                
        except Exception as e:
            logger.error(f"Error saving user location: {str(e)}")
            return {'error': f'Failed to save user location: {str(e)}'}, 500
    
    def get_disease_tracking(self):
        """Get disease tracking data by location"""
        try:
            # Get query parameters
            location_string = request.args.get('location')
            crop_type = request.args.get('crop_type')
            days = int(request.args.get('days', 30))
            
            # Build query
            query = supabase.table('disease_tracking').select('*')
            
            if location_string:
                query = query.eq('location_string', location_string)
            if crop_type:
                query = query.eq('crop_type', crop_type)
            
            result = query.execute()
            
            if result.data:
                return {
                    'success': True,
                    'data': result.data,
                    'filters': {
                        'location': location_string,
                        'crop_type': crop_type,
                        'days': days
                    }
                }, 200
            else:
                return {
                    'success': True,
                    'data': [],
                    'message': 'No disease tracking data found'
                }, 200
                
        except Exception as e:
            logger.error(f"Error getting disease tracking: {str(e)}")
            return {'error': f'Failed to get disease tracking: {str(e)}'}, 500


def setup_location_api(app: Flask, api: Api):
    """Setup location API routes"""
    location_api = LocationAPI(api)
    logger.info("Location API routes registered successfully")
    return location_api


# Utility functions for location data
def build_location_string(country: str, province: str = None, district: str = None, sector: str = None) -> str:
    """Build a standardized location string"""
    parts = []
    if sector:
        parts.append(sector)
    if district:
        parts.append(district)
    if province:
        parts.append(province)
    if country:
        parts.append(country)
    return ', '.join(parts)


def parse_location_string(location_string: str) -> Dict[str, str]:
    """Parse a location string into components"""
    parts = [part.strip() for part in location_string.split(',')]
    
    result = {'country': parts[-1] if parts else None}
    
    if len(parts) >= 2:
        result['province'] = parts[-2]
    if len(parts) >= 3:
        result['district'] = parts[-3]
    if len(parts) >= 4:
        result['sector'] = parts[-4]
    
    return result


def validate_location_data(location_data: Dict) -> List[str]:
    """Validate location data and return list of errors"""
    errors = []
    
    if not location_data.get('country'):
        errors.append('Country is required')
    
    if 'confidence_score' in location_data:
        try:
            score = float(location_data['confidence_score'])
            if score < 0 or score > 100:
                errors.append('Confidence score must be between 0 and 100')
        except (ValueError, TypeError):
            errors.append('Confidence score must be a valid number')
    
    return errors 